import Link from 'next/link';
import { Shield, Zap, FileText, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1b2a] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00c9a7] flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#0d1b2a]" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Ship<span className="text-[#00c9a7]">Happens</span>
          </span>
        </div>
        <Link
          href="/screen"
          className="flex items-center gap-2 bg-[#00c9a7] text-[#0d1b2a] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#00e5c0] transition-colors"
        >
          Start Screening
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00c9a7]/10 blur-[100px]" />
        </div>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,201,167,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#00c9a7]/10 border border-[#00c9a7]/30 rounded-full px-4 py-1.5 mb-8">
            <Zap className="w-3.5 h-3.5 text-[#00c9a7]" />
            <span className="text-[#00c9a7] text-xs font-semibold uppercase tracking-widest">
              AI Compliance Agent
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none mb-6">
            <span className="text-[#00c9a7]">8 seconds.</span>
            <br />
            Audit-ready.
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
            Screen any person or company against 200+ sanctions lists, PEP databases, and adverse
            media — instantly. No analyst. No wait. No guesswork.
          </p>

          <Link
            href="/screen"
            className="inline-flex items-center gap-2 bg-[#00c9a7] text-[#0d1b2a] font-bold text-base px-8 py-4 rounded-xl hover:bg-[#00e5c0] transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,201,167,0.3)]"
          >
            Start a new screening
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Demo scenarios */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">
            Try a live demo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/screen?demo=high-risk" className="group">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-red-500/40 hover:bg-red-500/5 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                    HIGH RISK
                  </span>
                </div>
                <div className="font-bold text-white text-lg mb-1">Viktor Yanukovych</div>
                <div className="text-slate-400 text-sm mb-4">Individual · Ukraine</div>
                <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                  <span>• 4 sanctions matches (OFAC, EU, UN, UK)</span>
                  <span>• PEP Tier 1 — Former President of Ukraine</span>
                  <span>• 47 adverse media articles</span>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-[#00c9a7] text-sm font-semibold group-hover:gap-3 transition-all">
                  Run this demo
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link href="/screen?demo=clear" className="group">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-[#00c9a7]/40 hover:bg-[#00c9a7]/5 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00c9a7]/10 border border-[#00c9a7]/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#00c9a7]" />
                  </div>
                  <span className="text-xs font-bold text-[#00c9a7] bg-[#00c9a7]/10 border border-[#00c9a7]/20 px-2.5 py-1 rounded-full">
                    CLEAR
                  </span>
                </div>
                <div className="font-bold text-white text-lg mb-1">Maria Kovacheva</div>
                <div className="text-slate-400 text-sm mb-4">Individual · Bulgaria</div>
                <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                  <span>• 0 sanctions matches</span>
                  <span>• Not a PEP — no political exposure</span>
                  <span>• 0 adverse media results</span>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-[#00c9a7] text-sm font-semibold group-hover:gap-3 transition-all">
                  Run this demo
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-t border-white/5 px-6 py-5">
        <div className="max-w-4xl mx-auto grid grid-cols-3 sm:grid-cols-5 gap-6 text-center">
          {[
            { val: '8s', lbl: 'Per check' },
            { val: '200+', lbl: 'Watchlists' },
            { val: '1.4M', lbl: 'Sanctions entries' },
            { val: '€0.02', lbl: 'Unit cost' },
            { val: '0', lbl: 'Analysts needed' },
          ].map(({ val, lbl }) => (
            <div key={lbl}>
              <div className="text-xl font-black text-[#00c9a7]">{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-4 text-center text-xs text-slate-600">
        © 2026 ShipHappens · hello@shiphappens.ai
      </footer>
    </main>
  );
}
