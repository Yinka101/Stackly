import React, { useState } from 'react';
import { api } from '@/lib/api';

/** Inline HTML helpers */
function inlineHtml(text: string): string {
  return text
    .replace(/\u2014/g, '-')           // strip em dash
    .replace(/\u2013/g, '-')           // strip en dash
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Render markdown-ish review text into React elements.
 * Handles: **bold**, numbered lists (newline or inline "1. 2. 3."), blank-line paragraphs.
 */
function renderMarkdown(raw: string) {
  // Strip em/en dashes from the whole text first
  const text = raw.replace(/\u2014/g, ' - ').replace(/\u2013/g, '-');

  // Split into blocks on blank lines
  const blocks = text.split(/\n\n+/);
  const elements: React.ReactElement[] = [];

  blocks.forEach((block, bi) => {
    const trimmed = block.trim();

    // Detect numbered list — either newline-separated OR inline "1. ... 2. ... 3. ..."
    const inlineListMatch = /\b1\.\s/.test(trimmed) && /\b2\.\s/.test(trimmed);
    const newlineListMatch = /^\d+\.\s/.test(trimmed) && trimmed.includes('\n');

    if (inlineListMatch || newlineListMatch) {
      // Split on numbered item boundaries
      const items = trimmed
        .split(/(?=\b\d+\.\s)/)
        .map(s => s.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);

      elements.push(
        <ol key={bi} className="list-decimal list-outside ml-4 space-y-1.5 text-sm">
          {items.map((item, ii) => (
            <li key={ii} className="leading-relaxed pl-1"
                dangerouslySetInnerHTML={{ __html: inlineHtml(item) }} />
          ))}
        </ol>
      );
      return;
    }

    // Heading-like line: starts with ** and ends with **
    if (/^\*\*[^*]+\*\*[:\s]/.test(trimmed)) {
      elements.push(
        <p key={bi} className="text-sm leading-relaxed font-medium"
           dangerouslySetInnerHTML={{ __html: inlineHtml(trimmed) }} />
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={bi} className="text-sm leading-relaxed"
         dangerouslySetInnerHTML={{ __html: inlineHtml(trimmed) }} />
    );
  });

  return elements;
}

export default function PortfolioReview() {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const getReview = async () => {
    setLoading(true);
    try {
      const data = await api.post<{ review: string }>('/ai/review', {});
      setReview(data.review);
    } catch {
      setReview("I can't connect right now. A quick tip: spreading your practice dollars across different types of companies reduces risk. Try adding a few different sectors!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl p-5 border border-ink/8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">📊</div>
        <div>
          <h3 className="font-display font-bold text-ink">Review my portfolio</h3>
          <p className="text-xs text-ink/50">Practice money only - not financial advice</p>
        </div>
      </div>

      {!review && (
        <button
          onClick={() => { void getReview(); }}
          disabled={loading}
          className="w-full bg-primary text-white font-display font-semibold rounded-xl py-3
                     hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Penny is looking…' : 'Get feedback on my portfolio'}
        </button>
      )}

      {review && (
        <div className="space-y-4">
          <div className="bg-primary/5 rounded-xl p-4 text-sm text-ink space-y-2">
            {renderMarkdown(review)}
          </div>
          <button
            onClick={() => { void getReview(); }}
            disabled={loading}
            className="w-full border-2 border-primary text-primary font-semibold rounded-xl py-2.5
                       hover:bg-primary/5 active:scale-95 transition-all min-h-[44px] text-sm"
          >
            {loading ? 'Refreshing…' : 'Refresh review'}
          </button>
        </div>
      )}
    </div>
  );
}
