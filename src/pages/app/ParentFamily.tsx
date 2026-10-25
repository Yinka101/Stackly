import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FamilySummary from './family/FamilySummary';
import FamilyApprovals from './family/FamilyApprovals';
import FamilyControls from './family/FamilyControls';
import FamilyStarters from './family/FamilyStarters';
import FamilyPrivacy from './family/FamilyPrivacy';

type Tab = 'summary' | 'approvals' | 'controls' | 'starters' | 'privacy';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'summary',   label: 'Summary',   icon: '📊' },
  { id: 'approvals', label: 'Approvals', icon: '✅' },
  { id: 'controls',  label: 'Controls',  icon: '🎛️' },
  { id: 'starters',  label: 'Starters',  icon: '💬' },
  { id: 'privacy',   label: 'Privacy',   icon: '🔒' },
];

export default function ParentFamily() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('summary');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-ink/8 bg-canvas">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-ink">My family</h1>
          <button
            onClick={() => nav('/onboarding/add-learner')}
            className="bg-primary text-white font-semibold rounded-xl px-4 py-2 text-sm
                       hover:bg-primary/90 active:scale-95 transition-all min-h-[40px]"
          >
            + Add learner
          </button>
        </div>

        {/* Tab bar */}
        <div className="max-w-2xl mx-auto mt-3 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                          transition-all min-h-[36px] whitespace-nowrap
                          ${tab === t.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-ink/5 text-ink/60 hover:text-ink hover:bg-ink/10'}`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5">
          {tab === 'summary'   && <FamilySummary />}
          {tab === 'approvals' && <FamilyApprovals />}
          {tab === 'controls'  && <FamilyControls />}
          {tab === 'starters'  && <FamilyStarters />}
          {tab === 'privacy'   && <FamilyPrivacy />}
        </div>
      </div>
    </div>
  );
}
