import { Routes, Route, Navigate } from 'react-router-dom';

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

      {/* Protected app shell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          {/* Learner-only routes */}
          <Route element={<RequireLearner />}>
            <Route path="/app/home"   element={<LearnerHome />} />
            <Route path="/app/learn"  element={<Placeholder title="Lessons" coming="Lessons are coming next." />} />
            <Route path="/app/invest" element={<Placeholder title="Invest" coming="Paper trading portfolio is coming next." />} />
            <Route path="/app/paypal" element={<Placeholder title="PayPal Lab" coming="PayPal sandbox lab is coming next." />} />
            <Route path="/app/coach"  element={<Placeholder title="AI Coach" coming="Penny the AI coach is coming next." />} />
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
