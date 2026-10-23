import { type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from '../lib/clsx';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        className="flex gap-1 bg-surface-raised rounded-[var(--radius-xl)] p-1 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={clsx(
              'relative flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-4 py-2.5',
              'rounded-[var(--radius-xl)] text-sm font-semibold transition-colors min-h-[44px]',
              active === tab.id ? 'text-primary' : 'text-ink-muted hover:text-ink'
            )}
          >
            {active === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-surface rounded-[var(--radius-xl)] shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      {/* Panel */}
      <div
        id={`tabpanel-${active}`}
        role="tabpanel"
        aria-labelledby={active}
        className="mt-4"
      >
        {activeTab?.content}
      </div>
    </div>
  );
}
