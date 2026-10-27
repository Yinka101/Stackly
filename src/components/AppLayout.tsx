import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSession } from '@/lib/session';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  parentOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/home',   icon: '🏠', label: 'Home'       },
  { to: '/app/learn',  icon: '📚', label: 'Learn'      },
  { to: '/app/invest', icon: '📈', label: 'Invest'     },
  { to: '/app/paypal', icon: '💳', label: 'PayPal Lab' },
  { to: '/app/coach',  icon: '🤖', label: 'Coach'      },
  { to: '/app/family', icon: '👨‍👩‍👧', label: 'Family', parentOnly: true },
];

const AVATAR_EMOJI: Record<string, string> = {
  owl: '🦉', fox: '🦊', bear: '🐻', panda: '🐼', butterfly: '🦋',
  turtle: '🐢', lion: '🦁', frog: '🐸', rocket: '🚀', star: '⭐',
  seedling: '🌱', chart: '📈',
};

export default function AppLayout() {
  const { user, logout } = useSession();
  const nav = useNavigate();

  const items = NAV_ITEMS.filter((n) => !n.parentOnly || user?.role === 'parent');

  const handleLogout = () => { void logout().then(() => nav('/')); };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Skip to content - visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
                   focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-xl
                   focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* ── Sidebar (desktop ≥ 768px) ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-surface border-r border-ink/8 px-3 py-6"
             aria-label="Main navigation">
        {/* Logo - links back to landing page */}
        <a
          href="https://stackly-web.onrender.com"
          className="flex items-center gap-2 px-3 mb-8 hover:opacity-80 transition-opacity"
          aria-label="Stackly home"
        >
          <span className="text-2xl">🌱</span>
          <span className="font-display font-bold text-xl text-ink">Stackly</span>
        </a>

        <nav aria-label="App sections" className="flex flex-col gap-1 flex-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                 transition-all min-h-[44px]
                 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                 ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-ink/70 hover:bg-ink/5 hover:text-ink'}`
              }
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User badge */}
        <div className="border-t border-ink/8 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="text-xl" aria-hidden="true">
              {user?.avatar
                ? (AVATAR_EMOJI[user.avatar] ?? '🌱')
                : (user?.role === 'parent' ? '👤' : '🌱')}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {user?.nickname ?? user?.email ?? 'You'}
              </p>
              <p className="text-xs text-ink/50 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left px-3 py-2 text-sm text-ink/50 hover:text-red-600
                       rounded-xl hover:bg-red-50 transition-all min-h-[44px]
                       focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-ink/8">
          <a
            href="https://stackly-web.onrender.com"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Stackly home"
          >
            <span className="text-xl">🌱</span>
            <span className="font-display font-bold text-ink">Stackly</span>
          </a>
          <button
            onClick={handleLogout}
            className="text-ink/50 text-sm hover:text-ink min-h-[44px] min-w-[44px]
                       flex items-center justify-end
                       focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2"
          >
            Sign out
          </button>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-auto pb-20 md:pb-0 outline-none"
        >
          <Outlet />
        </main>
      </div>

      {/* ── Bottom tab bar (mobile) ───────────────────────────────────────────── */}
      <nav
        aria-label="App sections"
        className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-ink/8
                   flex items-center justify-around px-2 py-2 z-50 safe-bottom"
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl
               min-w-[44px] min-h-[44px] justify-center transition-all
               focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset
               ${isActive ? 'text-primary' : 'text-ink/50'}`
            }
          >
            <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
            <span className="text-[10px] font-semibold leading-none" aria-hidden="true">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
