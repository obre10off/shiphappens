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
  chain: SectionBase & { steps: string[]; stats: Stat[]; sources: string[] };
  stakes: SectionBase & { stats: Stat[]; tags: string[]; sources: string[] };
  solution: SectionBase & { steps: string[]; tags: string[] };
  demo: { label: string; kicker: string; heading: string; cta: string };
  speed: SectionBase & {
    bad: { title: string; time: string };
    good: { title: string; time: string };
    highlight: { strong: string; rest: string };
    sources: string[];
  };
  value: SectionBase & { pillars: string[] };
  market: SectionBase & { stats: Stat[]; note: string; sources: string[] };
  vision: SectionBase & { items: string[] };
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
      { value: '31–60%', label: 'of KYC still done manually' },
      { value: '$206B', label: 'spent on compliance every year' },
      { value: '$2,000+', label: 'per single corporate KYC review' },
    ],
    sources: [
      'LexisNexis Risk Solutions (2023)',
      'Fenergo / The Fintech Times (2024)',
      'Statista (2024)',
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
    stats: [
      { value: '90–95%', label: 'of alerts are false positives' },
      { value: 'up to 90%', label: 'of analyst time spent dismissing them' },
    ],
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
  demo: {
    label: 'Live demo',
    kicker: 'See it run',
    heading: 'From a name to a defensible decision.',
    cta: 'Try a live screening',
  },
  speed: {
    label: 'Measurable outcome',
    kicker: 'Measurable outcome',
    heading: 'Hours of work, compressed into seconds.',
    bad: { title: 'Manual adverse-media check', time: '60–90 min' },
    good: { title: 'Clavis', time: '< 2 min' },
    highlight: { strong: '~97% less time', rest: '— consistent, reproducible, every run.' },
    sources: ['Manual baseline: industry benchmark', 'Clavis: measured runtime'],
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
    kicker: 'The market',
    heading: 'A growing, mandatory spend.',
    stats: [
      { value: '$206B', label: 'compliance spend / year (SAM)' },
      { value: '~$22B', label: 'RegTech market today (2025)' },
      { value: '~$85B', label: 'RegTech by 2035, ~21% CAGR' },
    ],
    note: 'Every regulated institution is a buyer — because the law makes them one.',
    sources: ['Precedence Research (2025)', 'LexisNexis Risk Solutions (2023)'],
  },
  vision: {
    label: 'Where we go next',
    kicker: 'Where we go next',
    heading: 'From one-time screening to always-on assurance.',
    items: ['Ongoing counterparty monitoring', 'Deeper research'],
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
      { value: '31–60%', label: 'от KYC още се прави ръчно' },
      { value: '$206 млрд.', label: 'годишен разход за съответствие' },
      { value: '$2 000+', label: 'за една корпоративна KYC проверка' },
    ],
    sources: [
      'LexisNexis Risk Solutions (2023)',
      'Fenergo / The Fintech Times (2024)',
      'Statista (2024)',
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
    stats: [
      { value: '90–95%', label: 'от сигналите са фалшиви' },
      { value: 'до 90%', label: 'от времето отива за отхвърлянето им' },
    ],
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
  demo: {
    label: 'Демо на живо',
    kicker: 'Вижте я в действие',
    heading: 'От име до защитимо решение.',
    cta: 'Направете проверка на живо',
  },
  speed: {
    label: 'Измерим резултат',
    kicker: 'Измерим резултат',
    heading: 'Часове работа, събрани в секунди.',
    bad: { title: 'Ръчна проверка за негативни медии', time: '60–90 мин' },
    good: { title: 'Clavis', time: '< 2 мин' },
    highlight: { strong: '~97% по-малко време', rest: '— последователно и възпроизводимо, всеки път.' },
    sources: ['Ръчна база: индустриален показател', 'Clavis: измерено време'],
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
    kicker: 'Пазарът',
    heading: 'Растящ, задължителен разход.',
    stats: [
      { value: '$206 млрд.', label: 'разход за съответствие / година (SAM)' },
      { value: '~$22 млрд.', label: 'RegTech пазар днес (2025)' },
      { value: '~$85 млрд.', label: 'RegTech до 2035 г., ~21% CAGR' },
    ],
    note: 'Всяка регулирана институция е купувач — защото законът я задължава.',
    sources: ['Precedence Research (2025)', 'LexisNexis Risk Solutions (2023)'],
  },
  vision: {
    label: 'Накъде продължаваме',
    kicker: 'Накъде продължаваме',
    heading: 'От еднократна проверка към постоянна сигурност.',
    items: ['Постоянен мониторинг на контрагенти', 'По-задълбочено проучване'],
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
