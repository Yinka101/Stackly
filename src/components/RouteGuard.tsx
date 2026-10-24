import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/lib/session';

function Spinner() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

/** Requires any authenticated session */
export function RequireAuth({ redirect = '/onboarding' }: { redirect?: string }) {
  const { user, loading } = useSession();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={redirect} replace />;
  return <Outlet />;
}

/** Requires parent role */
export function RequireParent() {
  const { user, loading } = useSession();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login-parent" replace />;
  if (user.role !== 'parent') return <Navigate to="/app/home" replace />;
  return <Outlet />;
}

/** Requires learner role */
export function RequireLearner() {
  const { user, loading } = useSession();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/onboarding" replace />;
  if (user.role !== 'learner') return <Navigate to="/app/family" replace />;
  return <Outlet />;
}

/** Redirect to app if already signed in */
export function RedirectIfAuthed() {
  const { user, loading } = useSession();
  if (loading) return <Spinner />;
  if (user?.role === 'learner') return <Navigate to="/app/home" replace />;
  if (user?.role === 'parent') return <Navigate to="/app/family" replace />;
  return <Outlet />;
}
