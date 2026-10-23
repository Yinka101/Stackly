import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from '@/lib/session';

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

// App screens
import LearnerHome      from '@/pages/app/LearnerHome';
import ParentFamily     from '@/pages/app/ParentFamily';
import Placeholder      from '@/pages/app/Placeholder';
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
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login-parent" element={<ParentLogin />} />

      {/* Onboarding — redirect away if already signed in */}
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

      {/* PIN login — public (parent must be logged in via cookie to list learners) */}
      <Route path="/pin-login/:learnerId" element={<PinLogin />} />

      {/* /app smart redirect — goes here before the protected shell */}
      <Route path="/app" element={<AppRedirect />} />

      {/* Protected app shell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          {/* Learner-only routes */}
          <Route element={<RequireLearner />}>
            <Route path="/app/home"          element={<LearnerHome />} />
            <Route path="/app/learn"         element={<PathMap />} />
            <Route path="/app/learn/:id"     element={<LessonReader />} />
            <Route path="/app/invest"        element={<Placeholder title="Invest"     coming="Paper trading portfolio is coming next." />} />
            <Route path="/app/paypal"        element={<Placeholder title="PayPal Lab" coming="PayPal sandbox lab is coming next." />} />
            <Route path="/app/coach"         element={<Placeholder title="AI Coach"   coming="Penny the AI coach is coming next." />} />
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
  );
}
