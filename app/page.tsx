import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
} from 'lucide-react';

/** Two-dot brand mark (indigo + ink), echoing the Diligent logo. */
function LogoMark({ className = '' }: { className?: string }) {
  return (
    <span className={`relative inline-block h-5 w-7 ${className}`} aria-hidden>
      <span className="absolute left-0 top-1 h-3 w-3 rounded-full bg-accent" />
      <span className="absolute left-3 top-1 h-3 w-3 rounded-full bg-ink" />
    </span>
  );
}

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-ink">ShipHappens</span>
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-night text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-2.5 text-[13px]">
        <span aria-hidden>🛰️</span>
        <span className="text-white/90">
          Real sanctions, PEP &amp; adverse-media screening in ~8 seconds
        </span>
        <Link href="/screen" className="inline-flex items-center gap-1 font-medium text-white hover:text-accent-muted">
          Try it live <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Wordmark />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#how" className="hover:text-ink transition-colors">How it works</a>
          <a href="#demo" className="hover:text-ink transition-colors">Live demo</a>
          <a href="#trust" className="hover:text-ink transition-colors">Coverage</a>
        </div>
        <Link
          href="/screen"
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Start screening
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}

/** Hero product mock — mirrors Diligent's "analyzing the alert" checklist card. */
function ScreeningMock() {
  const done = [
    'Checking OpenSanctions (sanctions + PEP)',
    'Scanning adverse media (web + AI)',
    'Building the evidence trail',
  ];
  return (
    <div className="rounded-2xl border border-line bg-surface-alt p-4 shadow-[0_10px_40px_rgba(10,10,10,0.06)] sm:p-6">
      <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-sm font-medium text-ink">ShipHappens is screening the subject</span>
        </div>
        <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-medium text-muted">
          Viktor Y.
        </span>
      </div>

      <div className="mt-4 space-y-3 px-1">
        {done.map((label) => (
          <div key={label} className="flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
            <span className="text-sm text-ink">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          <span className="text-sm text-muted">Synthesizing risk report…</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            AI compliance agent
          </div>
          <h1 className="text-5xl font-medium leading-[1.02] tracking-[-0.03em] text-ink sm:text-6xl">
            AI agents for
            <br />
            KYC/AML screening
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Screen any person or company against 200+ sanctions lists, PEP databases, and adverse
            media — and get an audit-ready risk report in about eight seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/screen"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Start a screening
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent"
            >
              See a live demo
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <ScreeningMock />
      </div>
    </section>
  );
}

function Trust() {
  const stats = [
    { val: '8s', lbl: 'Per screening' },
    { val: '200+', lbl: 'Watchlists' },
    { val: '1.4M', lbl: 'Sanctions entries' },
    { val: '€0.02', lbl: 'Unit cost' },
  ];
  return (
    <section id="trust" className="border-y border-line bg-surface-alt">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-center text-sm text-muted">
          Built for compliance teams at fintechs, banks and payment firms
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.lbl} className="text-center">
              <div className="text-3xl font-medium tracking-tight text-ink">{s.val}</div>
              <div className="mt-1 text-xs text-faint">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Enter the subject',
      body: 'Name, date of birth, country and optional company or case context — that is all the agent needs.',
    },
    {
      icon: ShieldCheck,
      title: 'The agent screens',
      body: 'It checks OpenSanctions for sanctions and PEP hits, then scans the web for adverse media and high-risk activity.',
    },
    {
      icon: FileText,
      title: 'Get an audit-ready report',
      body: 'A weighted risk band and score, per-signal evidence, a timeline, cited sources and a downloadable PDF.',
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.02em] text-ink sm:text-4xl">
        From a name to a defensible decision.
      </h2>
      <p className="mt-4 max-w-xl text-muted">
        One agent runs the whole workflow an analyst would — in seconds, with the evidence attached.
      </p>
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="bg-canvas p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-ink">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-faint">0{i + 1}</span>
            </div>
            <h3 className="mt-5 text-lg font-medium text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DemoCards() {
  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-3xl font-medium tracking-[-0.02em] text-ink sm:text-4xl">
          Try a live demo.
        </h2>
        <Link href="/screen" className="hidden items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover sm:inline-flex">
          Screen someone else
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link href="/screen?demo=high-risk" className="group">
          <div className="h-full rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-ink/30">
            <div className="mb-5 flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </span>
              <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500">
                HIGH RISK
              </span>
            </div>
            <div className="text-lg font-medium text-ink">Viktor Yanukovych</div>
            <div className="mt-1 text-sm text-muted">Individual · Ukraine</div>
            <ul className="mt-4 space-y-1.5 text-sm text-faint">
              <li>Sanctions hits across OFAC, EU, UN, UK</li>
              <li>Confirmed PEP — former head of state</li>
              <li>Extensive recent adverse media</li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent group-hover:gap-2.5 transition-all">
              Run this demo
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link href="/screen?demo=clear" className="group">
          <div className="h-full rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-ink/30">
            <div className="mb-5 flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-risk-clear/10">
                <CheckCircle className="h-5 w-5 text-risk-clear" />
              </span>
              <span className="rounded-full bg-risk-clear/10 px-2.5 py-1 text-xs font-semibold text-risk-clear">
                CLEAR
              </span>
            </div>
            <div className="text-lg font-medium text-ink">Maria Kovacheva</div>
            <div className="mt-1 text-sm text-muted">Individual · Bulgaria</div>
            <ul className="mt-4 space-y-1.5 text-sm text-faint">
              <li>No sanctions matches</li>
              <li>Not a politically exposed person</li>
              <li>No adverse media found</li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent group-hover:gap-2.5 transition-all">
              Run this demo
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="bg-night">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="mx-auto max-w-2xl text-4xl font-medium leading-tight tracking-[-0.02em] text-white sm:text-5xl">
          Stop manual screening.
          <br />
          Start deciding.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-white/60">
          Replace a 45-minute manual check with an audit-ready report in seconds.
        </p>
        <Link
          href="/screen"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Start a screening
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-faint sm:flex-row">
        <Wordmark />
        <span>© 2026 ShipHappens · hello@shiphappens.ai</span>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      <AnnouncementBar />
      <Nav />
      <Hero />
      <Trust />
      <HowItWorks />
      <DemoCards />
      <CtaBand />
      <Footer />
    </main>
  );
}
