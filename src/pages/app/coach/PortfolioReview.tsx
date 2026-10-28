import { useState } from 'react';
import { api } from '@/lib/api';
import { renderMarkdown } from '@/utils/markdown';


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
