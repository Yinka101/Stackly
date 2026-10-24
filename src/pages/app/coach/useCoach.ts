/**
 * Hook that manages the coach chat state and SSE streaming.
 * Each learner gets their own isolated context — no cross-learner data.
 */
import { useState, useCallback, useRef } from 'react';
import { tokenStore } from '@/lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
}

export function useCoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm Penny, your money coach 🌱 Ask me anything about money, PayPal, or investing — or try one of the buttons below!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string, lessonContext?: string) => {
    if (!text.trim() || loading) return;
    setError('');

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', streaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const token = tokenStore.get();
      const res = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ message: text, lessonContext }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let full = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const chunk = JSON.parse(json) as { delta: string; done: boolean };
            full += chunk.delta;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: full, streaming: !chunk.done } : m,
              ),
            );
            if (chunk.done) break;
          } catch { /* malformed */ }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "I couldn't connect right now. Try again in a moment!", streaming: false }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearHistory = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hi again! I'm Penny 🌱 What would you like to learn about today?",
    }]);
    setError('');
  }, []);

  return { messages, loading, error, sendMessage, clearHistory };
}
