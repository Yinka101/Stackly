/**
 * AgentCoach - Agentic commerce interface.
 *
 * Learner types a goal → agent runs → shows "Coach's plan" timeline.
 * Every step is labelled in plain English; Builders/Investors also see
 * the technical tool name in smaller text.
 */
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/lib/session';
import { tokenStore, getApiBase, loadConfig } from '@/lib/api';
import { Sparkles, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, Bot } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type PlanStepKind = 'understood' | 'tool_call' | 'tool_result' | 'reasoning' | 'proposed' | 'error' | 'waiting';

interface PlanStep {
  id: string;
  kind: PlanStepKind;
  label: string;
  detail?: string;
  tool?: string;
  technicalName?: string;
  ts: number;
}

interface AgentPlan {
  planId: string;
  status: 'proposed' | 'failed' | 'no_purchase' | 'thinking';
  summary: string;
  steps: PlanStep[];
}

interface PastPlan {
  id: string;
  status: string;
  userMessage: string;
  summary: string | null;
  steps: PlanStep[];
  createdAt: string;
  kitId: string | null;
  orderId: string | null;
}

// ── Starter prompts ───────────────────────────────────────────────────────────

const STARTERS: Record<string, string[]> = {
  sprouts: [
    'Help me start a lemonade stand!',
    'I want to learn how to save money.',
    'What can I buy to get more practice money?',
  ],
  builders: [
    'Help me start a small business.',
    'I want to try investing - where do I start?',
    'What kit should I get to learn faster?',
  ],
  investors: [
    'I want to build a practice portfolio.',
    'Show me what kits are available and why.',
    'What is the best kit for learning about markets?',
  ],
};

// BASE is resolved at call-time via getApiBase() so config.json is respected

// ── Step icon ─────────────────────────────────────────────────────────────────

function StepIcon({ kind }: { kind: PlanStepKind }) {
  switch (kind) {
    case 'understood': return <Bot className="w-4 h-4 text-primary" />;
    case 'tool_call':  return <ChevronRight className="w-4 h-4 text-ink/40 animate-pulse" />;
    case 'tool_result': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'reasoning':  return <Sparkles className="w-4 h-4 text-amber-500" />;
    case 'proposed':   return <Sparkles className="w-4 h-4 text-primary" />;
    case 'waiting':    return <Clock className="w-4 h-4 text-amber-500" />;
    case 'error':      return <XCircle className="w-4 h-4 text-red-500" />;
    default:           return <AlertCircle className="w-4 h-4 text-ink/40" />;
  }
}

// ── Plan timeline ─────────────────────────────────────────────────────────────

function PlanTimeline({ steps, status, summary, band }: { steps: PlanStep[]; status: string; summary: string; band: string }) {
  const showTechnical = band === 'builders' || band === 'investors';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-ink">Coach's plan</span>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
          status === 'proposed' ? 'bg-amber-100 text-amber-700' :
          status === 'no_purchase' ? 'bg-green-100 text-green-700' :
          status === 'failed' ? 'bg-red-100 text-red-600' :
          'bg-ink/10 text-ink/60'
        }`}>
          {status === 'proposed' ? 'Waiting for parent' :
           status === 'no_purchase' ? 'Done' :
           status === 'failed' ? 'Could not complete' : status}
        </span>
      </div>

      <ol className="divide-y divide-[var(--color-border)]">
        {steps.map((step) => (
          <li key={step.id} className="px-4 py-3">
            <button
              className="w-full flex items-start gap-3 text-left"
              onClick={() => setExpandedId(expandedId === step.id ? null : step.id)}
            >
              <span className="mt-0.5 shrink-0"><StepIcon kind={step.kind} /></span>
              <span className="flex-1 min-w-0">
                <span className="text-sm text-ink font-medium">{step.label}</span>
                {showTechnical && step.technicalName && (
                  <span className="block text-[10px] font-mono text-ink/30 mt-0.5 truncate">{step.technicalName}</span>
                )}
              </span>
              {step.detail && (
                <ChevronRight className={`w-4 h-4 text-ink/30 shrink-0 transition-transform mt-0.5 ${expandedId === step.id ? 'rotate-90' : ''}`} />
              )}
            </button>
            {expandedId === step.id && step.detail && (
              <div className="mt-2 ml-7 text-xs text-ink/60 bg-[var(--color-bg)] rounded-xl p-3 whitespace-pre-wrap break-words">
                {step.kind === 'tool_result' && step.detail.startsWith('{')
                  ? (() => { try { return JSON.stringify(JSON.parse(step.detail), null, 2); } catch { return step.detail; } })()
                  : step.detail}
              </div>
            )}
          </li>
        ))}
      </ol>

      {summary && (
        <div className="px-4 py-4 bg-[var(--color-primary-light)] border-t border-[var(--color-border)]">
          <p className="text-sm text-ink leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}

// ── Past plans list ───────────────────────────────────────────────────────────

function PastPlans({ plans, onSelect }: { plans: PastPlan[]; onSelect: (p: PastPlan) => void }) {
  if (!plans.length) return null;
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-2 px-1">Past plans</p>
      <div className="flex flex-col gap-2">
        {plans.slice(0, 5).map((p) => (
          <button key={p.id}
            onClick={() => onSelect(p)}
            className="text-left rounded-xl border border-[var(--color-border)] px-4 py-3 hover:border-primary/40 transition-colors bg-[var(--color-surface)]">
            <p className="text-sm font-medium text-ink truncate">{p.userMessage}</p>
            <p className="text-xs text-ink/40 mt-0.5">{p.status} · {new Date(p.createdAt).toLocaleDateString()}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AgentCoach() {
  const { user } = useSession();
  const band = (user as { band?: string })?.band ?? 'sprouts';
  const starters = STARTERS[band] ?? STARTERS.sprouts;

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [pastPlans, setPastPlans] = useState<PastPlan[]>([]);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load past plans on mount
  useEffect(() => {
    void loadPastPlans();
  }, []);

  async function loadPastPlans() {
    try {
      await loadConfig();
      const base = getApiBase().replace(/\/api$/, '');
      const res = await fetch(`${base}/agent/plans`, {
        headers: { Authorization: `Bearer ${tokenStore.get() ?? ''}` },
      });
      if (res.ok) {
        const data = await res.json() as PastPlan[];
        setPastPlans(data);
      }
    } catch { /* offline - ignore */ }
  }

  async function runAgent() {
    const msg = input.trim();
    if (!msg || busy) return;
    setError('');
    setBusy(true);
    setActivePlan({ planId: '', status: 'thinking', summary: '', steps: [
      { id: 'thinking', kind: 'understood', label: 'Thinking…', ts: Date.now() },
    ]});
    setInput('');

    try {
      await loadConfig();
      const base = getApiBase().replace(/\/api$/, '');
      const res = await fetch(`${base}/agent/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenStore.get() ?? ''}`,
        },
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      const plan = await res.json() as AgentPlan;
      setActivePlan(plan);
      void loadPastPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setActivePlan(null);
    } finally {
      setBusy(false);
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void runAgent(); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-ink">Coach Agent</h1>
          <p className="text-xs text-ink/50">Tell me your goal - I'll build a plan and ask your parent.</p>
        </div>
      </div>

      {/* Starter chips */}
      {!activePlan && !busy && (
        <div className="flex flex-wrap gap-2">
          {starters.map((s) => (
            <button key={s}
              onClick={() => { setInput(s); setTimeout(() => textareaRef.current?.focus(), 50); }}
              className="text-sm px-3 py-1.5 rounded-pill bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] font-medium hover:bg-primary/20 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={busy}
          rows={2}
          placeholder="What do you want to do? e.g. help me start a lemonade stand"
          className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-ink resize-none focus:outline-none focus:border-primary/60 disabled:opacity-50 placeholder:text-ink/30"
        />
        <button
          onClick={() => void runAgent()}
          disabled={busy || !input.trim()}
          className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
          aria-label="Send"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Active plan timeline */}
      {activePlan && (
        <PlanTimeline
          steps={activePlan.steps}
          status={activePlan.status}
          summary={activePlan.summary}
          band={band}
        />
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-ink/30 text-center mt-1 leading-relaxed">
        The Coach can suggest kits but never spends money. Every purchase needs your parent's OK.
      </p>

      {/* Past plans */}
      <PastPlans plans={pastPlans} onSelect={(p) => {
        setActivePlan({ planId: p.id, status: p.status as AgentPlan['status'], summary: p.summary ?? '', steps: p.steps });
      }} />
    </div>
  );
}
