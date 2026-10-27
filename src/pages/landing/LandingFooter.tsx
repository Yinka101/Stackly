import Seedling from '@/assets/Seedling';

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-ink)] text-white py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Logo row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Seedling mood="happy" size={32} />
            <span className="font-display font-bold text-lg">Stackly</span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#for-parents" className="hover:text-white transition-colors">For parents</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a
              href="https://github.com/Yinka101/Stackly"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub ↗
            </a>
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="bg-white/5 rounded-[var(--radius-xl)] p-5 mb-6 border border-white/10">
          <p className="text-sm text-white/70 leading-relaxed">
            <strong className="text-white">Educational disclaimer:</strong> Stackly is an educational tool only. Nothing on this site, in the app, or from the AI coach is financial advice. All portfolio activity uses Practice Dollars - fictional currency with no real monetary value. Past example returns are for illustration only and are not a prediction of future results. Any real PayPal transactions are initiated and approved solely by adults. Stackly is not affiliated with PayPal, Inc. or any brokerage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-white/40">
          <span>© {year} Stackly. Released under the MIT License.</span>
          <span>Practice money only. Not financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
