import { useEffect, useRef, useState } from 'react';

export interface SseEvent {
  type: string;
  label: string;
  detail: string;
  tech?: string;
  ts: number;
}

export function useSse(orderId: string | null) {
  const [events, setEvents] = useState<SseEvent[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Same-origin in production (Hono serves frontend); /api proxy in dev
    const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
    const es = new EventSource(`${base}/paypal/orders/${orderId}/events`, { withCredentials: true });
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as Omit<SseEvent, 'ts'>;
        setEvents(prev => [...prev, { ...data, ts: Date.now() }]);
      } catch {
        // heartbeat or malformed — ignore
      }
    };

    es.onerror = () => {
      // Connection dropped — stop reconnecting, show last state
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [orderId]);

  const clear = () => setEvents([]);
  return { events, clear };
}
