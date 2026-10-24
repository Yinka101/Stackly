import { useNavigate } from 'react-router-dom';
import Seedling from '@/assets/Seedling';

export default function OnboardingFork() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <Seedling mood="happy" className="mx-auto mb-4 w-20 h-20" />
        <h1 className="font-display text-3xl text-ink font-bold">Welcome to Stackly</h1>
        <p className="text-ink/70 mt-2 text-lg">Are you a parent or a learner?</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          onClick={() => nav('/onboarding/parent')}
          className="flex-1 bg-primary text-white font-display font-semibold text-lg rounded-2xl py-4 px-6
                     hover:bg-primary/90 active:scale-95 transition-all focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-primary min-h-[56px]"
        >
          I'm a parent
        </button>
        <button
          onClick={() => nav('/onboarding/learner-select')}
          className="flex-1 bg-surface border-2 border-primary text-primary font-display font-semibold
                     text-lg rounded-2xl py-4 px-6 hover:bg-primary/5 active:scale-95 transition-all
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                     min-h-[56px]"
        >
          I'm a learner
        </button>
      </div>

      <p className="text-ink/50 text-sm text-center">
        Already have an account?{' '}
        <button onClick={() => nav('/login-parent')} className="text-primary underline">
          Parent sign in
        </button>
      </p>
    </div>
  );
}
