import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface LearnerRow {
  id: string;
  nickname: string;
  band: string;
  avatar: string;
}

const AVATAR: Record<string, string> = {
  owl:'🦉',fox:'🦊',bear:'🐻',panda:'🐼',butterfly:'🦋',
  turtle:'🐢',lion:'🦁',frog:'🐸',rocket:'🚀',star:'⭐',seedling:'🌱',chart:'📈',
};

export default function FamilyPrivacy() {
  const [learnersList, setLearnersList] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    api.get<LearnerRow[]>('/auth/learners')
      .then(setLearnersList)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const exportData = async (learnerId: string, nickname: string) => {
    setExporting(learnerId);
    try {
      // Use raw fetch so we can handle the download blob
      const token = localStorage.getItem('stackly_token');
      const base = import.meta.env.VITE_API_URL ?? '';
      const res = await fetch(`${base}/family/export/${learnerId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stackly-${nickname.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully.');
    } catch {
      showToast('Export failed — please try again.');
    } finally {
      setExporting(null);
    }
  };

  const deleteLearner = async (learnerId: string) => {
    setDeleting(learnerId);
    try {
      await api.del(`/family/learners/${learnerId}`);
      setLearnersList((prev) => prev.filter((l) => l.id !== learnerId));
      setConfirmId(null);
      showToast('Learner and all data permanently deleted.');
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p className="text-ink/40 text-sm text-center py-8">Loading…</p>;

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-ink text-white text-sm
                        px-4 py-2 rounded-xl shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-1">Your data rights</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          You can export everything Stackly holds about a learner as a JSON file, or permanently
          delete a learner and all their data. Deletion is irreversible.
          We store only what is listed in our privacy notice: nickname, age band, avatar, lesson
          progress, practice trades, and Coach conversations.
        </p>
      </div>

      {learnersList.length === 0 ? (
        <p className="text-ink/50 text-sm text-center py-6">No learners yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {learnersList.map((l) => (
            <div key={l.id} className="bg-surface border border-ink/8 rounded-2xl p-4">
              {/* Learner info */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{AVATAR[l.avatar] ?? '🌱'}</span>
                <div>
                  <p className="font-semibold text-ink">{l.nickname}</p>
                  <p className="text-xs text-ink/50 capitalize">{l.band}</p>
                </div>
              </div>

              {/* Actions */}
              {confirmId === l.id ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-red-700">
                    Permanently delete {l.nickname}?
                  </p>
                  <p className="text-xs text-red-600">
                    This removes all lessons, trades, Coach history, and agent plans.
                    This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void deleteLearner(l.id)}
                      disabled={deleting === l.id}
                      className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm font-semibold
                                 disabled:opacity-50 hover:bg-red-600 transition-colors"
                    >
                      {deleting === l.id ? 'Deleting…' : 'Yes, delete permanently'}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-4 bg-ink/8 text-ink rounded-xl py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => void exportData(l.id, l.nickname)}
                    disabled={exporting === l.id}
                    className="flex-1 bg-ink/8 text-ink font-semibold rounded-xl py-2.5 text-sm
                               hover:bg-ink/12 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {exporting === l.id ? 'Exporting…' : '⬇ Export data'}
                  </button>
                  <button
                    onClick={() => setConfirmId(l.id)}
                    className="flex-1 bg-red-50 text-red-600 font-semibold rounded-xl py-2.5 text-sm
                               hover:bg-red-100 active:scale-95 transition-all border border-red-200"
                  >
                    🗑 Delete learner
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
