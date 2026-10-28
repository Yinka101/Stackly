import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from '@/lib/session';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DemoDrawer } from '@/components/DemoDrawer';

// Guards
import { RequireAuth, RequireParent, RequireLearner, RedirectIfAuthed } from '@/components/RouteGuard';

// Layout
import AppLayout from '@/components/AppLayout';

// Landing
import Landing from '@/pages/Landing';

// Onboarding / auth
import OnboardingFork   from '@/pages/onboarding/OnboardingFork';
import ParentConsent    from '@/pages/onboarding/ParentConsent';
import ParentRegister   from '@/pages/onboarding/ParentRegister';
import AddLearner       from '@/pages/onboarding/AddLearner';
import LearnerSelect    from '@/pages/onboarding/LearnerSelect';
import PinLogin         from '@/pages/onboarding/PinLogin';
import ParentLogin      from '@/pages/onboarding/ParentLogin';
import ForgotPassword  from '@/pages/onboarding/ForgotPassword';
import ResetPassword   from '@/pages/onboarding/ResetPassword';

// App screens
import { PayPalLabPage } from '@/pages/paypal/PayPalLabPage';
import LearnerHome      from '@/pages/app/LearnerHome';
import InvestPage       from '@/pages/app/InvestPage';
import ParentFamily     from '@/pages/app/ParentFamily';
import Placeholder      from '@/pages/app/Placeholder';
import CoachPage        from '@/pages/app/coach/CoachPage';
import PathMap          from '@/pages/app/learn/PathMap';
import LessonReader     from '@/pages/app/learn/LessonReader';

/** Sends /app to the right home screen based on session role. */
function AppRedirect() {
  const { user, loading } = useSession();
  if (loading) return null;
  if (user?.role === 'learner') return <Navigate to="/app/home"   replace />;
  if (user?.role === 'parent')  return <Navigate to="/app/family" replace />;
  return <Navigate to="/onboarding" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <DemoDrawer />
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login-parent"    element={<ParentLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* Onboarding - redirect away if already signed in */}
      <Route element={<RedirectIfAuthed />}>
        <Route path="/onboarding" element={<OnboardingFork />} />
        <Route path="/onboarding/parent" element={<ParentConsent />} />
        <Route path="/onboarding/parent-register" element={<ParentRegister />} />
      </Route>

      {/* Requires parent for add-learner + learner-select */}
      <Route path="/onboarding/learner-select" element={<LearnerSelect />} />
      <Route element={<RequireParent />}>
        <Route path="/onboarding/add-learner" element={<AddLearner />} />
      </Route>

      {/* PIN login - public (parent must be logged in via cookie to list learners) */}
      <Route path="/pin-login/:learnerId" element={<PinLogin />} />

      {/* /app smart redirect - goes here before the protected shell */}
      <Route path="/app" element={<AppRedirect />} />

      {/* Protected app shell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          {/* Learner-only routes */}
          <Route element={<RequireLearner />}>
            <Route path="/app/home"          element={<LearnerHome />} />
            <Route path="/app/learn"         element={<PathMap />} />
            <Route path="/app/learn/:id"     element={<LessonReader />} />
            <Route path="/app/invest"        element={<InvestPage />} />
            <Route path="/app/paypal"        element={<PayPalLabPage />} />
            <Route path="/app/coach"         element={<CoachPage />} />
          </Route>

          {/* Parent-only routes */}
          <Route element={<RequireParent />}>
            <Route path="/app/family" element={<ParentFamily />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
