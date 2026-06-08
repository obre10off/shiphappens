// lib/presentation/content.ts
// ────────────────────────────────────────────────────────────────────────────
// All copy for the Clavis pitch deck, per locale. The <PresentationDeck>
// component is purely presentational and reads every string from here, so the
// English (`en`) and Bulgarian (`bg`) decks share one layout.
//
// Deck is deliberately sparse: each slide carries a headline + the few most
// important points (bullet titles / key stats only — no descriptive sub-text).
// ────────────────────────────────────────────────────────────────────────────

/** YouTube video id for the demo embed (from https://youtu.be/<id>). */
export const DEMO_VIDEO_ID = 'rZh0m8bg67k';

export type Locale = 'en' | 'bg';

export type Stat = { value: string; label: string };

interface SectionBase {
  label: string;
  kicker: string;
  heading: string;
}

export interface PresentationContent {
  ui: {
    prev: string;
    next: string;
    sources: string; // "Sources:" prefix
    goToSlide: string; // aria prefix for the progress dots
    briefing: string; // title-slide footer
    year: string;
  };
  title: { label: string; product: string; subtitle: string };
  problem: SectionBase & { stats: Stat[]; sources: string[] };
  human: SectionBase & { items: string[] };
  chain: SectionBase & {
    steps: string[];
    stat: Stat; // single headline figure — the share of alerts that are noise
    takeaway: { strong: string; rest: string }; // the human-cost consequence
    sources: string[];
  };
  stakes: SectionBase & { stats: Stat[]; tags: string[]; sources: string[] };
  solution: SectionBase & { steps: string[]; tags: string[] };
  speed: SectionBase & {
    scenario: { label: string; value: string }[];
    bad: { title: string; rows: { label: string; value: string }[]; totalLabel: string; total: string };
    good: { title: string; rows: { label: string; value: string }[]; totalLabel: string; total: string };
    highlight: { strong: string; rest: string };
    sources: string[];
  };
  value: SectionBase & { pillars: string[] };
  market: SectionBase & {
    layers: { tier: string; value: string; label: string }[];
    note: string;
    sources: string[];
  };
  competitors: SectionBase & {
    xAxis: { label: string; low: string; high: string };
    yAxis: { label: string; low: string; high: string };
    ideal: string; // label for the empty top-right "destination" zone
    players: { name: string; slug: string; x: number; y: number; us?: boolean }[];
    insight: string;
  };
  business: SectionBase & {
    tiers: { name: string; price: string; detail: string; highlight?: boolean }[];
    note: string;
  };
  gtm: SectionBase & {
    phases: { tag: string; title: string; points: string[] }[];
  };
  team: SectionBase & {
    members: { name: string; role: string; slug: string; companies: { name: string; slug: string }[] }[];
    note: string;
    tags: string[];
  };
  ask: SectionBase & {
    raise: string;
    raiseLabel: string;
    allocation: Stat[];
    detail: string;
    milestone: string;
  };
  appendix: {
    label: string;
    moat: { kicker: string; heading: string; points: string[] };
    trust: { kicker: string; heading: string; points: string[] };
  };
  closing: { label: string; title1: string; title2: string; cta: string; contact: string };
}

// ── English ──────────────────────────────────────────────────────────────────

export const en: PresentationContent = {
  ui: {
    prev: 'Prev',
    next: 'Next',
    sources: 'Sources:',
    goToSlide: 'Go to slide',
    briefing: 'Investor & demo briefing',
    year: '2026',
  },
  title: {
    label: 'Clavis',
    product: 'Clavis',
    subtitle: 'The AI compliance analyst.',
  },
  problem: {
    label: 'The problem',
    kicker: 'The problem',
    heading: 'Compliance still runs on humans copy-pasting names.',
    stats: [
      { value: '~3 hrs', label: 'of skilled analyst time per corporate review' },
      { value: '$2,000+', label: 'in cost for that same single review' },
      { value: '$200B+', label: 'spent on compliance every year' },
    ],
    sources: [
      'Statista; Corporate Compliance Insights (2024)',
      'Castellum.AI; SymphonyAI (2025)',
      'LexisNexis Risk Solutions (2023)',
    ],
  },
  human: {
    label: 'Why it breaks',
    kicker: 'Why it breaks',
    heading: 'The weakest link is the human in the loop.',
    items: [
      'Data-entry errors',
      'Document misidentification',
      'Confirmation bias',
      'Improper risk assessment',
      'Failure to update records',
      'Inconsistent verdicts',
    ],
  },
  chain: {
    label: 'The chain reaction',
    kicker: 'The chain reaction',
    heading: 'One typo triggers hours of phantom work.',
    steps: ['Human error', 'False match', 'Alert fires', 'Hours lost'],
    stat: { value: '90–95%', label: 'of every alert a team investigates is a false positive — pure noise' },
    takeaway: {
      strong: 'Analysts spend most of their day clearing that noise',
      rest: ' — not catching real risk.',
    },
    sources: ['FACCTUM (2026)', 'sanctions.io; Sardine AI'],
  },
  stakes: {
    label: 'The stakes',
    kicker: 'The stakes',
    heading: 'Getting it wrong is no longer survivable.',
    stats: [
      { value: '~$4B', label: 'in AML/KYC fines in 2025' },
      { value: '$1B+', label: 'on crypto alone' },
      { value: '90%', label: 'of banks: human error hits risk decisions' },
    ],
    tags: ['Regulatory exposure', 'Reputational damage', 'Wrong counterparty'],
    sources: ['ComplyAdvantage; FinCEN (2025)', 'Industry surveys, 2024–25'],
  },
  solution: {
    label: 'The solution',
    kicker: 'The solution',
    heading: 'Clavis does the whole screening — in seconds.',
    steps: ['Enter the subject', 'The agent screens', 'Audit-ready report'],
    tags: [
      '200+ watchlists',
      '1.4M sanctions entries',
      'Live adverse-media search',
      'Cited evidence trail',
      'Downloadable PDF',
    ],
  },
  speed: {
    label: 'Measurable outcome',
    kicker: 'Measurable outcome',
    heading: 'Same coverage, one-seventh the cost.',
    scenario: [
      { label: 'Portfolio', value: '10 FoF' },
      { label: 'Horizon', value: '5 years' },
      { label: 'Investors', value: '2000' },
    ],
    bad: {
      title: 'Manual KYC team',
      rows: [
        { label: 'Reviews over 5 yrs (onboard + monitor)', value: '~600' },
        { label: 'Time each', value: '~60 min' },
        { label: 'KYC analyst rate', value: '€30–35 / h' },
      ],
      totalLabel: 'Manual 5-yr cost',
      total: '€21,000',
    },
    good: {
      title: 'Clavis',
      rows: [
        { label: 'Time per report', value: '1–10 min' },
        { label: 'Scales with research depth', value: 'auto' },
        { label: 'Coverage', value: 'same 2000, always-on' },
      ],
      totalLabel: 'With Clavis',
      total: '~€3,000',
    },
    highlight: {
      strong: '7× lower cost',
      rest: '— and the same analysts screen far more, or you run a leaner team.',
    },
    sources: ['Median KYC analyst rate: EU market (€30–35/h)', 'Clavis: measured runtime'],
  },
  value: {
    label: 'Why it matters',
    kicker: 'Why it matters',
    heading: 'Four ways Clavis pays for itself.',
    pillars: [
      'Faster, more reliable',
      'No human bias',
      'Significant cost savings',
      'Reputational & legal protection',
    ],
  },
  market: {
    label: 'The market',
    kicker: 'Market size',
    heading: 'A mandatory market — and every fund in the room is a buyer.',
    layers: [
      { tier: 'TAM', value: '$200B+', label: 'spent on financial-crime compliance worldwide every year' },
      { tier: 'SAM', value: '~$11B', label: 'KYC/AML & screening software by 2030 — the budget we displace' },
      { tier: 'SOM', value: '~$300M', label: 'our beachhead: funds, crypto & mid-market fintech in the EU' },
    ],
    note: 'Our wedge is autonomous adverse-media + sanctions screening — and funds themselves buy it to screen LPs, GPs and deal counterparties.',
    sources: ['LexisNexis Risk Solutions (2023)', 'MarketsandMarkets; Precedence Research (2025)'],
  },
  competitors: {
    label: 'The landscape',
    kicker: 'Competitor analysis',
    heading: 'Incumbents own the data. We own the autonomy.',
    xAxis: { label: 'Data depth', low: 'Single lists', high: 'Multi-source + live web' },
    yAxis: { label: 'Autonomy', low: 'Manual', high: 'Autonomous AI agent' },
    ideal: 'Autonomous + full coverage',
    players: [
      { name: 'LexisNexis', slug: 'lexisnexis', x: 88, y: 15 },
      { name: 'World-Check (LSEG)', slug: 'lseg', x: 68, y: 25 },
      { name: 'ComplyAdvantage', slug: 'complyadvantage', x: 55, y: 45 },
      { name: 'Sumsub', slug: 'sumsub', x: 38, y: 36 },
      { name: 'Greenlite AI', slug: 'greenlite', x: 30, y: 78 },
      { name: 'Clavis', slug: 'clavis', x: 73, y: 84, us: true },
    ],
    insight: 'Incumbents have the databases but no autonomy; AI startups automate one step. Clavis is the only autonomous agent that screens end-to-end — and the round closes our data-depth gap.',
  },
  business: {
    label: 'Business model',
    kicker: 'How we make money',
    heading: 'Enterprise-first SaaS — annual contracts, venture-scale ACV.',
    tiers: [
      {
        name: 'Pilot',
        price: '€3K / mo',
        detail: '8-week paid design-partner pilot · success metrics · guided onboarding',
      },
      {
        name: 'Platform',
        price: 'from €30K / yr',
        detail: 'Annual license · seats + bundled screenings · always-on monitoring · SSO',
        highlight: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        detail: 'High-volume API, data residency, dedicated SLAs & audit support',
      },
    ],
    note: 'Land via a paid pilot, expand into a platform license + recurring monitoring. Target ACV €30K+ — every customer is a contract, not a credit card.',
  },
  gtm: {
    label: 'Go-to-market',
    kicker: 'Go-to-market strategy',
    heading: 'Warm fund network in, integrations and partners out.',
    phases: [
      {
        tag: '01 · Land',
        title: 'Our fund network',
        points: [
          'Warm intros → first design partners',
          'They screen LPs & counterparties day one',
        ],
      },
      {
        tag: '02 · Integrate',
        title: 'Data & platforms',
        points: [
          'Interpol, OpenSanctions, OFAC & EU lists',
          'Embed in onboarding: Sumsub, Persona, Alloy',
        ],
      },
      {
        tag: '03 · Distribute',
        title: 'Directories & partners',
        points: [
          'RegTech directories + consultant referrals',
          'Our investors’ portfolios = first customers',
        ],
      },
    ],
  },
  team: {
    label: 'Why us',
    kicker: 'Why us',
    heading: 'Operators who have built, shipped, and lived this problem.',
    members: [
      {
        name: 'Alexander Gekov',
        role: 'Founder of TalentSight (HRTech) · Software Engineer at n8n',
        slug: 'alexander',
        companies: [
          { name: 'TalentSight', slug: 'talentsight' },
          { name: 'n8n', slug: 'n8n' },
        ],
      },
      {
        name: 'Vladislav Manolov',
        role: 'Data Scientist at Nexo · lived the problem inside big tech',
        slug: 'vladislav',
        companies: [{ name: 'Nexo', slug: 'nexo' },{ name: 'Marktlink Capital', slug: 'marktlink' }],
      },
      {
        name: 'Dimitar Parpulov',
        role: 'Software Developer at Tuk-Tam',
        slug: 'dimitar',
        companies: [{ name: 'Tuk-Tam', slug: 'tuktam' }],
      },
      {
        name: 'Mario Yordanoff',
        role: 'Founder @ Zynna.app — Marketing',
        slug: 'mario',
        companies: [{ name: 'Zynna.app', slug: 'agency' }],
      },
    ],
    note: 'Builders and a data scientist who have shipped at scale and felt this pain first-hand.',
    tags: [
      'Close observers of the venture field',
      'International exposure: Netherlands · Bulgaria · England · France',
    ],
  },
  ask: {
    label: 'The ask',
    kicker: 'The ask',
    heading: 'Raising €150K for 10% to reach feature parity and revenue.',
    raise: '€150K',
    raiseLabel: 'for 10% · ~12 months runway',
    allocation: [
      { value: '55%', label: 'Product — feature parity: monitoring, more data sources, case management' },
      { value: '30%', label: 'Go-to-market — convert fund design partners into paid contracts' },
      { value: '10%', label: 'Data & compliance — licensing + start the SOC 2 path' },
      { value: '5%', label: 'Operations & runway' },
    ],
    detail: 'Most of the round goes into product — closing the gap with incumbents on monitoring, data coverage and case management — then into converting our warm fund pipeline into paying contracts.',
    milestone: '12-month goal: feature parity on screening, 5+ paying design-partner funds, first recurring revenue — ready to raise a seed.',
  },
  appendix: {
    label: 'Appendix',
    moat: {
      kicker: 'Appendix · Defensibility',
      heading: 'Why this compounds into a moat.',
      points: [
        'Proprietary screening workflow tuned across 200+ watchlists & live media',
        'Every run improves prompts, scoring and the false-positive filter',
        'Audit trail & monitoring data create switching costs once embedded',
        'Compliance certifications (SOC 2 / ISO) are a barrier newcomers can’t skip',
      ],
    },
    trust: {
      kicker: 'Appendix · Trust & accuracy',
      heading: 'Built to be defensible, not just fast.',
      points: [
        'Every claim carries a cited source — no unsourced AI assertions',
        'Deterministic sanctions/PEP matching; the LLM only summarises evidence',
        'Conservative, low-confidence flags on ambiguous identities',
        'Optional human-in-the-loop — Clavis assists the analyst, owns the busywork',
      ],
    },
  },
  closing: {
    label: 'Closing',
    title1: 'Stop manual screening.',
    title2: 'Start deciding.',
    cta: 'Try Clavis live',
    contact: 'clavis.ai · hello@clavis.ai',
  },
};

// ── Bulgarian ────────────────────────────────────────────────────────────────

export const bg: PresentationContent = {
  ui: {
    prev: 'Назад',
    next: 'Напред',
    sources: 'Източници:',
    goToSlide: 'Към слайд',
    briefing: 'Брифинг за инвеститори и демо',
    year: '2026',
  },
  title: {
    label: 'Clavis',
    product: 'Clavis',
    subtitle: 'AI анализаторът за съответствие.',
  },
  problem: {
    label: 'Проблемът',
    kicker: 'Проблемът',
    heading: 'Съответствието още разчита на хора, които копират имена на ръка.',
    stats: [
      { value: '~3 ч.', label: 'време на квалифициран аналитик за една корпоративна проверка' },
      { value: '$2 000+', label: 'разход за същата тази една проверка' },
      { value: '$206 млрд.', label: 'годишен разход за съответствие' },
    ],
    sources: [
      'Statista; Corporate Compliance Insights (2024)',
      'Castellum.AI; SymphonyAI (2025)',
      'LexisNexis Risk Solutions (2023)',
    ],
  },
  human: {
    label: 'Защо се проваля',
    kicker: 'Защо се проваля',
    heading: 'Най-слабото звено е човекът в процеса.',
    items: [
      'Грешки при въвеждане',
      'Неразпознати документи',
      'Пристрастие към потвърждение',
      'Неправилна оценка на риска',
      'Неактуализирани досиета',
      'Непоследователни заключения',
    ],
  },
  chain: {
    label: 'Верижната реакция',
    kicker: 'Верижната реакция',
    heading: 'Една печатна грешка поражда часове фантомна работа.',
    steps: ['Човешка грешка', 'Фалшиво съвпадение', 'Задейства се сигнал', 'Изгубени часове'],
    stat: { value: '90–95%', label: 'от всеки сигнал, който екипът проверява, е фалшив — чист шум' },
    takeaway: {
      strong: 'Аналитиците прекарват по-голямата част от деня в разчистване на този шум',
      rest: ' — вместо да хващат реален риск.',
    },
    sources: ['FACCTUM (2026)', 'sanctions.io; Sardine AI'],
  },
  stakes: {
    label: 'Залогът',
    kicker: 'Залогът',
    heading: 'Цената на грешката вече е непосилна.',
    stats: [
      { value: '~$4 млрд.', label: 'AML/KYC глоби през 2025 г.' },
      { value: '$1 млрд.+', label: 'само върху крипто' },
      { value: '90%', label: 'от банките: човешката грешка влияе на риска' },
    ],
    tags: ['Регулаторен риск', 'Репутационни щети', 'Грешен контрагент'],
    sources: ['ComplyAdvantage; FinCEN (2025)', 'Индустриални проучвания, 2024–25'],
  },
  solution: {
    label: 'Решението',
    kicker: 'Решението',
    heading: 'Clavis прави цялата проверка — за секунди.',
    steps: ['Въведете субекта', 'Агентът проверява', 'Готов за одит доклад'],
    tags: [
      '200+ списъка за наблюдение',
      '1.4M записа за санкции',
      'Търсене на негативни медии на живо',
      'Цитирана доказателствена следа',
      'PDF за изтегляне',
    ],
  },
  speed: {
    label: 'Измерим резултат',
    kicker: 'Измерим резултат',
    heading: 'Същото покритие, на една седма от цената.',
    scenario: [
      { label: 'Портфолио', value: '10 fund-of-funds' },
      { label: 'Хоризонт', value: '5 години' },
      { label: 'Инвеститори', value: '220' },
    ],
    bad: {
      title: 'Ръчен KYC екип',
      rows: [
        { label: 'Проверки за 5 г. (onboard + наблюдение)', value: '~600' },
        { label: 'Време за всяка', value: '~60 мин' },
        { label: 'Ставка KYC аналитик', value: '€30–35 / ч' },
      ],
      totalLabel: 'Ръчно за 5 г.',
      total: '€21 000',
    },
    good: {
      title: 'Clavis',
      rows: [
        { label: 'Време за доклад', value: '1–10 мин' },
        { label: 'Според дълбочината на проучване', value: 'авто' },
        { label: 'Покритие', value: 'същите 220, постоянно' },
      ],
      totalLabel: 'С Clavis',
      total: '~€3 000',
    },
    highlight: {
      strong: '7× по-ниска цена',
      rest: '— а същите аналитици проверяват много повече, или екипът е по-малък.',
    },
    sources: ['Медианна ставка KYC аналитик: ЕС (€30–35/ч)', 'Clavis: измерено време'],
  },
  value: {
    label: 'Защо има значение',
    kicker: 'Защо има значение',
    heading: 'Четири начина, по които Clavis се изплаща.',
    pillars: [
      'По-бързо и по-надеждно',
      'Без човешки пристрастия',
      'Значителни икономии',
      'Репутационна и правна защита',
    ],
  },
  market: {
    label: 'Пазарът',
    kicker: 'Размер на пазара',
    heading: 'Задължителен пазар — и всеки фонд в залата е купувач.',
    layers: [
      { tier: 'TAM', value: '$200 млрд.+', label: 'годишен световен разход за съответствие срещу финансови престъпления' },
      { tier: 'SAM', value: '~$11 млрд.', label: 'KYC/AML и софтуер за проверка до 2030 — бюджетът, който изместваме' },
      { tier: 'SOM', value: '~$300 млн.', label: 'нашият плацдарм: фондове, крипто и финтех от среден сегмент в ЕС' },
    ],
    note: 'Нашият клин е автономна проверка на негативни медии и санкции — а самите фондове я купуват, за да проверяват LP-та, GP-та и контрагенти по сделки.',
    sources: ['LexisNexis Risk Solutions (2023)', 'MarketsandMarkets; Precedence Research (2025)'],
  },
  competitors: {
    label: 'Пазарът',
    kicker: 'Анализ на конкуренцията',
    heading: 'Конкурентите владеят данните. Ние владеем автономността.',
    xAxis: { label: 'Дълбочина на данните', low: 'Единични списъци', high: 'Много източници + жива мрежа' },
    yAxis: { label: 'Автономност', low: 'Ръчно', high: 'Автономен AI агент' },
    ideal: 'Автономно + пълно покритие',
    players: [
      { name: 'LexisNexis', slug: 'lexisnexis', x: 88, y: 15 },
      { name: 'World-Check (LSEG)', slug: 'lseg', x: 68, y: 25 },
      { name: 'ComplyAdvantage', slug: 'complyadvantage', x: 55, y: 45 },
      { name: 'Sumsub', slug: 'sumsub', x: 38, y: 36 },
      { name: 'Greenlite AI', slug: 'greenlite', x: 30, y: 78 },
      { name: 'Clavis', slug: 'clavis', x: 73, y: 84, us: true },
    ],
    insight: 'Конкурентите имат базите данни, но без автономност; AI стартъпите автоматизират една стъпка. Clavis е единственият автономен агент, който проверява от край до край — а рундът затваря разликата в данните.',
  },
  business: {
    label: 'Бизнес модел',
    kicker: 'Как печелим пари',
    heading: 'SaaS за предприятия — годишни договори, venture-scale ACV.',
    tiers: [
      {
        name: 'Пилот',
        price: '€3K / мес.',
        detail: '8-седмичен платен пилот с партньор · метрики за успех · водено внедряване',
      },
      {
        name: 'Платформа',
        price: 'от €30K / год.',
        detail: 'Годишен лиценз · места + включени проверки · постоянно наблюдение · SSO',
        highlight: true,
      },
      {
        name: 'Enterprise',
        price: 'По договаряне',
        detail: 'Обемен API, локация на данните, специализирани SLA и одит',
      },
    ],
    note: 'Влизаме с платен пилот и разширяваме до платформен лиценз + повтарящо се наблюдение. Целеви ACV €30K+ — всеки клиент е договор, не кредитна карта.',
  },
  gtm: {
    label: 'Към пазара',
    kicker: 'Стратегия за пазара',
    heading: 'Топла мрежа от фондове навътре, интеграции и партньори навън.',
    phases: [
      {
        tag: '01 · Вход',
        title: 'Нашата мрежа от фондове',
        points: [
          'Топли срещи → първи партньори',
          'Проверяват LP-та и контрагенти от ден едно',
        ],
      },
      {
        tag: '02 · Интеграция',
        title: 'Данни и платформи',
        points: [
          'Interpol, OpenSanctions, OFAC и ЕС списъци',
          'Вграждане в onboarding: Sumsub, Persona, Alloy',
        ],
      },
      {
        tag: '03 · Дистрибуция',
        title: 'Директории и партньори',
        points: [
          'RegTech директории + реферали от консултанти',
          'Портфейлите на инвеститорите ни = първи клиенти',
        ],
      },
    ],
  },
  team: {
    label: 'Защо ние',
    kicker: 'Защо ние',
    heading: 'Оператори, които са изграждали, пускали и живели с този проблем.',
    members: [
      {
        name: 'Александър Геков',
        role: 'Основател на TalentSight (HRTech) · Software Engineer в n8n',
        slug: 'alexander',
        companies: [
          { name: 'TalentSight', slug: 'talentsight' },
          { name: 'n8n', slug: 'n8n' },
        ],
      },
      {
        name: 'Владислав Манолов',
        role: 'Data Scientist в Nexo · преживял проблема в big tech',
        slug: 'vladislav',
        companies: [{ name: 'Nexo', slug: 'nexo' }],
      },
      {
        name: 'Димитър Парпулов',
        role: 'Software Developer в Тук-Там',
        slug: 'dimitar',
        companies: [{ name: 'Тук-Там', slug: 'tuktam' }],
      },
      {
        name: 'Марио Йорданов',
        role: 'Маркетинг и собственик на агенция — растеж и търсене',
        slug: 'mario',
        companies: [{ name: 'Агенция', slug: 'agency' }],
      },
    ],
    note: 'Строители и data scientist, които са пускали в мащаб и са усетили този проблем лично.',
    tags: [
      'Близки наблюдатели на венчър сектора',
      'Международен опит: Нидерландия · България · Англия · Франция',
    ],
  },
  ask: {
    label: 'Искането',
    kicker: 'Искането',
    heading: 'Набираме €150K за 10%, за да стигнем feature parity и приходи.',
    raise: '€150K',
    raiseLabel: 'за 10% · ~12 месеца писта',
    allocation: [
      { value: '55%', label: 'Продукт — feature parity: наблюдение, още източници на данни, case management' },
      { value: '30%', label: 'Към пазара — превръщане на фонд-партньорите в платени договори' },
      { value: '10%', label: 'Данни и съответствие — лицензи + старт на SOC 2' },
      { value: '5%', label: 'Операции и писта' },
    ],
    detail: 'По-голямата част от рунда отива в продукта — затваряне на разликата с конкурентите по наблюдение, покритие на данни и case management — и след това в превръщане на топлата ни мрежа от фондове в платени договори.',
    milestone: 'Цел за 12 месеца: feature parity по проверката, 5+ платещи фонд-партньори, първи повтарящи се приходи — готови за seed.',
  },
  appendix: {
    label: 'Приложение',
    moat: {
      kicker: 'Приложение · Защитимост',
      heading: 'Защо това се натрупва в защитен ров.',
      points: [
        'Собствен процес за проверка, настроен върху 200+ списъка и медии на живо',
        'Всеки цикъл подобрява промптове, оценяване и филтъра за фалшиви сигнали',
        'Одит следата и данните от наблюдение създават разходи за смяна',
        'Сертификати (SOC 2 / ISO) са бариера, която новите не могат да прескочат',
      ],
    },
    trust: {
      kicker: 'Приложение · Доверие и точност',
      heading: 'Създаден да е защитим, не само бърз.',
      points: [
        'Всяко твърдение носи цитиран източник — без недоказани AI заключения',
        'Детерминистично съвпадение за санкции/PEP; LLM само обобщава доказателства',
        'Консервативни флагове при ниска увереност за двусмислени самоличности',
        'Опционален човек в процеса — Clavis помага на аналитика и поема рутината',
      ],
    },
  },
  closing: {
    label: 'Заключение',
    title1: 'Спрете ръчните проверки.',
    title2: 'Започнете да решавате.',
    cta: 'Изпробвайте Clavis на живо',
    contact: 'clavis.ai · hello@clavis.ai',
  },
};

export const content: Record<Locale, PresentationContent> = { en, bg };
