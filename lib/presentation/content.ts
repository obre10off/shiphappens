// lib/presentation/content.ts
// ────────────────────────────────────────────────────────────────────────────
// All copy for the Clavis pitch deck, per locale. The <PresentationDeck>
// component is purely presentational and reads every string from here, so the
// English (`en`) and Bulgarian (`bg`) decks share one layout.
//
// Stat values that contain words (e.g. "up to 90%", "< 2 min") are localised
// per language; pure figures ("$206B", "31–60%") are kept identical.
// ────────────────────────────────────────────────────────────────────────────

/** YouTube video id for the demo embed (from https://youtu.be/<id>). */
export const DEMO_VIDEO_ID = 'rZh0m8bg67k';

export type Locale = 'en' | 'bg';

export type Stat = { value: string; label: string };
export type TitledItem = { t: string; d: string };

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
  problem: {
    label: string;
    kicker: string;
    heading: string;
    body: string;
    stats: Stat[];
    sources: string[];
  };
  human: {
    label: string;
    kicker: string;
    heading: string;
    body: string;
    items: TitledItem[];
  };
  chain: {
    label: string;
    kicker: string;
    heading: string;
    body: string;
    steps: TitledItem[];
    stats: Stat[];
    sources: string[];
  };
  stakes: {
    label: string;
    kicker: string;
    heading: string;
    body: string;
    stats: Stat[];
    tags: string[];
    sources: string[];
  };
  solution: {
    label: string;
    kicker: string;
    heading: string;
    body: string;
    steps: TitledItem[];
    tags: string[];
  };
  demo: { label: string; kicker: string; heading: string; note: string; cta: string };
  speed: {
    label: string;
    kicker: string;
    heading: string;
    body: string;
    bad: { title: string; time: string; note: string };
    good: { title: string; time: string; note: string };
    highlight: { strong: string; rest: string };
    sources: string[];
  };
  value: { label: string; kicker: string; heading: string; pillars: TitledItem[] };
  market: {
    label: string;
    kicker: string;
    heading: string;
    body: string;
    stats: Stat[];
    note: string;
    sources: string[];
  };
  vision: {
    label: string;
    kicker: string;
    heading: string;
    body: string;
    items: TitledItem[];
  };
  closing: {
    label: string;
    title1: string;
    title2: string;
    subtitle: string;
    cta: string;
    contact: string;
  };
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
    subtitle:
      'The AI compliance analyst. Screen anyone for sanctions, PEP status, and adverse media in seconds — with an audit-ready evidence trail.',
  },
  problem: {
    label: 'The problem',
    kicker: 'The problem',
    heading: 'Compliance still runs on humans copy-pasting names.',
    body: 'KYC/AML screening is the gate every bank, fintech and investor must pass before taking on a client — and most of it is still done by hand, one analyst at a time.',
    stats: [
      { value: '31–60%', label: 'of KYC review tasks are still done manually' },
      { value: '$206B', label: 'spent on financial-crime compliance every year, worldwide' },
      { value: '$2,000+', label: "cost to complete a single corporate client's KYC review" },
    ],
    sources: [
      'LexisNexis Risk Solutions, True Cost of Financial Crime Compliance (2023)',
      'Fenergo / The Fintech Times (2024)',
      'Statista, KYC review cost in corporate banking (2024)',
    ],
  },
  human: {
    label: 'Why it breaks',
    kicker: 'Why it breaks',
    heading: 'The weakest link in screening is the human in the loop.',
    body: 'Manual review introduces error at every step — and a single mistake cascades into hours of wasted work or an undetected risk.',
    items: [
      {
        t: 'Data-entry errors',
        d: 'A mistyped name or date of birth silently mismatches the customer — or fires a false alert.',
      },
      {
        t: 'Document misidentification',
        d: 'Altered or forged documents and signs of tampering get overlooked under time pressure.',
      },
      {
        t: 'Confirmation bias',
        d: 'Analysts skip standard checks for clients they already “trust” or recognise.',
      },
      {
        t: 'Improper risk assessment',
        d: 'Profiles are misclassified from shallow research or out-of-date rules.',
      },
      {
        t: 'Failure to update records',
        d: 'Ongoing monitoring and periodic file refreshes get neglected.',
      },
      {
        t: 'Inconsistency',
        d: 'Two analysts reach two different verdicts on the same subject.',
      },
    ],
  },
  chain: {
    label: 'The chain reaction',
    kicker: 'The chain reaction',
    heading: 'One typo triggers hours of phantom work.',
    body: 'Misspell a name and it false-matches a global watchlist. Now a compliance team has to manually clear an alert that should never have existed.',
    steps: [
      { t: 'Human error', d: 'A name or DOB is entered wrong.' },
      { t: 'False match', d: 'It hits a sanctions / watchlist entry.' },
      { t: 'Alert fires', d: 'A case is opened automatically.' },
      { t: 'Hours lost', d: 'Analysts manually clear a non-issue.' },
    ],
    stats: [
      { value: '90–95%', label: 'of screening alerts are false positives — pure noise' },
      { value: 'up to 90%', label: "of analysts' alert-investigation time is spent dismissing them" },
    ],
    sources: [
      'FACCTUM, AML False Positive Report (2026)',
      'sanctions.io; Sardine AI — industry benchmarks',
    ],
  },
  stakes: {
    label: 'The stakes',
    kicker: 'The stakes',
    heading: 'Getting it wrong is no longer survivable.',
    body: 'Regulators are escalating fast — and the heaviest enforcement is landing on exactly the digital-asset and fintech firms moving quickest.',
    stats: [
      { value: '~$4B', label: 'in global AML/KYC fines in 2025' },
      { value: '$1B+', label: 'of that on crypto alone — OKX $500M, KuCoin $297M, BitMEX $100M' },
      { value: '90%', label: 'of banks say human error directly impacts their risk decisions' },
    ],
    tags: ['Regulatory & legal exposure', 'Reputational damage', 'Onboarding the wrong counterparty'],
    sources: [
      'ComplyAdvantage; Mayer Brown; FinCEN enforcement actions (2025)',
      'Industry survey data, 2024–25',
    ],
  },
  solution: {
    label: 'The solution',
    kicker: 'The solution',
    heading: 'Clavis is an AI analyst that does the whole screening — in seconds.',
    body: 'One agent runs the exact workflow a human analyst would, then hands back a defensible decision with every source attached.',
    steps: [
      {
        t: 'Enter the subject',
        d: 'Name, date of birth, country, optional company or case context. That is all it needs.',
      },
      {
        t: 'The agent screens',
        d: 'Checks 200+ sanctions & PEP lists on OpenSanctions, then scans the live web for adverse media.',
      },
      {
        t: 'Audit-ready report',
        d: 'A weighted risk band & score, per-signal evidence, a timeline, cited sources and a PDF.',
      },
    ],
    tags: [
      '200+ watchlists',
      '1.4M sanctions entries',
      'Live adverse-media web search',
      'Cited evidence trail',
      'Downloadable PDF',
    ],
  },
  demo: {
    label: 'Live demo',
    kicker: 'See it run',
    heading: 'From a name to a defensible decision.',
    note: 'Demo video — ~20 seconds',
    cta: 'Or try a live screening yourself',
  },
  speed: {
    label: 'Measurable outcome',
    kicker: 'Measurable outcome',
    heading: 'Hours of work, compressed into seconds.',
    body: 'The same screening, done faster and more consistently — every time, with the evidence already attached.',
    bad: {
      title: 'Manual adverse-media check',
      time: '60–90 min',
      note: 'per single generic case — and a different verdict each time.',
    },
    good: {
      title: 'Clavis',
      time: '< 2 min',
      note: 'real-time web search + synthesis. A full sanctions/PEP screen lands in ~8s.',
    },
    highlight: {
      strong: '~97% less time',
      rest: 'on adverse media, with a consistent, reproducible result on every run.',
    },
    sources: [
      'Manual baseline: industry benchmark, 60–90 min/case',
      'Clavis: measured end-to-end runtime',
    ],
  },
  value: {
    label: 'Why it matters',
    kicker: 'Why it matters',
    heading: 'Four ways Clavis pays for itself.',
    pillars: [
      {
        t: 'Faster, more reliable screening',
        d: 'Decisions in seconds instead of hours — and the same answer every time, not analyst-by-analyst variance.',
      },
      {
        t: 'No human bias',
        d: 'No data-entry typos, no document misidentification, no confirmation bias, no improper risk assessment.',
      },
      {
        t: 'Significant cost savings',
        d: 'A ~$35–42/hr analyst hour and a $2,000+ corporate review collapse to pennies of compute per screen.',
      },
      {
        t: 'Protection from reputational & legal risk',
        d: 'A cited, audit-ready trail on every subject — the defensible record regulators expect.',
      },
    ],
  },
  market: {
    label: 'The market',
    kicker: 'The market',
    heading: 'A growing, mandatory spend.',
    body: 'Screening is not discretionary — it is a regulatory requirement for every regulated institution on earth. The tooling market is compounding.',
    stats: [
      { value: '$206B', label: 'spent on financial-crime compliance each year (SAM)' },
      { value: '~$22B', label: 'RegTech market today (2025) — our serviceable wedge' },
      { value: '~$85B', label: 'projected RegTech market by 2035, at ~21% CAGR' },
    ],
    note: 'Every fintech, bank, payment firm, crypto exchange and investment fund is a buyer — because the law makes them one.',
    sources: ['Precedence Research, RegTech Market (2025)', 'LexisNexis Risk Solutions (2023)'],
  },
  vision: {
    label: 'Where we go next',
    kicker: 'Where we go next',
    heading: 'From one-time screening to always-on assurance.',
    body: 'Onboarding is the wedge. The same agent extends naturally into the rest of the compliance lifecycle.',
    items: [
      {
        t: 'Ongoing counterparty monitoring',
        d: 'Continuously re-screen every relationship and alert the moment a subject’s risk changes — closing the “failure to update records” gap for good.',
      },
      {
        t: 'Deeper research',
        d: 'Richer entity resolution, network/UBO analysis and broader source coverage for high-risk enhanced due diligence.',
      },
    ],
  },
  closing: {
    label: 'Closing',
    title1: 'Stop manual screening.',
    title2: 'Start deciding.',
    subtitle:
      'Replace a 45-minute manual check with an audit-ready report in seconds — with no human error and the evidence attached.',
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
    subtitle:
      'AI анализаторът за съответствие. Проверявайте всеки за санкции, PEP статус и негативни медийни публикации за секунди — с готова за одит доказателствена следа.',
  },
  problem: {
    label: 'Проблемът',
    kicker: 'Проблемът',
    heading: 'Съответствието още разчита на хора, които копират имена на ръка.',
    body: 'KYC/AML проверката е бариерата, която всяка банка, финтех компания и инвеститор трябва да премине, преди да приеме клиент — и по-голямата част от нея все още се прави на ръка, от един анализатор наведнъж.',
    stats: [
      { value: '31–60%', label: 'от задачите по KYC проверка все още се извършват ръчно' },
      { value: '$206 млрд.', label: 'годишен световен разход за съответствие срещу финансови престъпления' },
      { value: '$2 000+', label: 'струва една KYC проверка на корпоративен клиент' },
    ],
    sources: [
      'LexisNexis Risk Solutions, True Cost of Financial Crime Compliance (2023)',
      'Fenergo / The Fintech Times (2024)',
      'Statista, KYC review cost in corporate banking (2024)',
    ],
  },
  human: {
    label: 'Защо се проваля',
    kicker: 'Защо се проваля',
    heading: 'Най-слабото звено в проверката е човекът в процеса.',
    body: 'Ръчната проверка въвежда грешки на всяка стъпка — а една-единствена грешка прераства в часове загубена работа или в неоткрит риск.',
    items: [
      {
        t: 'Грешки при въвеждане на данни',
        d: 'Сгрешено име или дата на раждане тихомълком разминава клиента — или задейства фалшив сигнал.',
      },
      {
        t: 'Неразпознати документи',
        d: 'Подправени или фалшифицирани документи и следи от манипулация се пропускат под напрежение.',
      },
      {
        t: 'Пристрастие към потвърждение',
        d: 'Анализаторите пропускат стандартни проверки за клиенти, на които вече „вярват“ или ги познават.',
      },
      {
        t: 'Неправилна оценка на риска',
        d: 'Профилите се класифицират грешно поради повърхностно проучване или остарели правила.',
      },
      {
        t: 'Неактуализирани досиета',
        d: 'Текущият мониторинг и периодичното обновяване на досиетата се пренебрегват.',
      },
      {
        t: 'Непоследователност',
        d: 'Двама анализатори стигат до две различни заключения за един и същ субект.',
      },
    ],
  },
  chain: {
    label: 'Верижната реакция',
    kicker: 'Верижната реакция',
    heading: 'Една печатна грешка поражда часове фантомна работа.',
    body: 'Сгрешете едно име и то фалшиво съвпада с глобален списък за наблюдение. Сега екип по съответствие трябва ръчно да изчисти сигнал, който никога не е трябвало да съществува.',
    steps: [
      { t: 'Човешка грешка', d: 'Име или дата на раждане е въведено грешно.' },
      { t: 'Фалшиво съвпадение', d: 'Засича запис от санкции / списък за наблюдение.' },
      { t: 'Задейства се сигнал', d: 'Автоматично се отваря случай.' },
      { t: 'Изгубени часове', d: 'Анализаторите ръчно изчистват несъществуващ проблем.' },
    ],
    stats: [
      { value: '90–95%', label: 'от сигналите при проверка са фалшиви — чист шум' },
      { value: 'до 90%', label: 'от времето на анализаторите за разследване на сигнали отива за отхвърлянето им' },
    ],
    sources: [
      'FACCTUM, AML False Positive Report (2026)',
      'sanctions.io; Sardine AI — индустриални показатели',
    ],
  },
  stakes: {
    label: 'Залогът',
    kicker: 'Залогът',
    heading: 'Цената на грешката вече е непосилна.',
    body: 'Регулаторите затягат бързо — и най-тежките санкции падат точно върху компаниите за дигитални активи и финтех, които се движат най-бързо.',
    stats: [
      { value: '~$4 млрд.', label: 'глобални AML/KYC глоби през 2025 г.' },
      { value: '$1 млрд.+', label: 'от тях само върху крипто — OKX $500M, KuCoin $297M, BitMEX $100M' },
      { value: '90%', label: 'от банките твърдят, че човешката грешка пряко влияе върху решенията им за риск' },
    ],
    tags: ['Регулаторен и правен риск', 'Репутационни щети', 'Приемане на грешен контрагент'],
    sources: [
      'ComplyAdvantage; Mayer Brown; правоприлагащи действия на FinCEN (2025)',
      'Индустриални проучвания, 2024–25',
    ],
  },
  solution: {
    label: 'Решението',
    kicker: 'Решението',
    heading: 'Clavis е AI анализатор, който прави цялата проверка — за секунди.',
    body: 'Един агент изпълнява точно работния процес на човек анализатор и връща защитимо решение с приложен всеки източник.',
    steps: [
      {
        t: 'Въведете субекта',
        d: 'Име, дата на раждане, държава, по избор компания или контекст по случая. Това е всичко необходимо.',
      },
      {
        t: 'Агентът проверява',
        d: 'Проверява 200+ списъка със санкции и PEP в OpenSanctions, после сканира интернет в реално време за негативни публикации.',
      },
      {
        t: 'Готов за одит доклад',
        d: 'Претеглена рискова категория и оценка, доказателства по всеки сигнал, хронология, цитирани източници и PDF.',
      },
    ],
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
    note: 'Демо видео — ~20 секунди',
    cta: 'Или направете проверка на живо сами',
  },
  speed: {
    label: 'Измерим резултат',
    kicker: 'Измерим резултат',
    heading: 'Часове работа, събрани в секунди.',
    body: 'Същата проверка, направена по-бързо и по-последователно — всеки път, с вече приложени доказателства.',
    bad: {
      title: 'Ръчна проверка за негативни медии',
      time: '60–90 мин',
      note: 'за един типичен случай — и различно заключение всеки път.',
    },
    good: {
      title: 'Clavis',
      time: '< 2 мин',
      note: 'търсене в реално време + синтез. Пълна проверка за санкции/PEP за ~8 сек.',
    },
    highlight: {
      strong: '~97% по-малко време',
      rest: 'за негативни медии, с последователен, възпроизводим резултат при всяко изпълнение.',
    },
    sources: [
      'Ръчна база: индустриален показател, 60–90 мин/случай',
      'Clavis: измерено време от край до край',
    ],
  },
  value: {
    label: 'Защо има значение',
    kicker: 'Защо има значение',
    heading: 'Четири начина, по които Clavis се изплаща.',
    pillars: [
      {
        t: 'По-бърза, по-надеждна проверка',
        d: 'Решения за секунди вместо часове — и един и същ отговор всеки път, без разлики между анализаторите.',
      },
      {
        t: 'Без човешки пристрастия',
        d: 'Без грешки при въвеждане, без неразпознати документи, без пристрастие към потвърждение, без неправилна оценка на риска.',
      },
      {
        t: 'Значителни икономии',
        d: 'Час на анализатор за ~$35–42 и корпоративна проверка за $2 000+ се свиват до стотинки изчисления на проверка.',
      },
      {
        t: 'Защита от репутационен и правен риск',
        d: 'Цитирана, готова за одит следа за всеки субект — защитимият запис, който регулаторите очакват.',
      },
    ],
  },
  market: {
    label: 'Пазарът',
    kicker: 'Пазарът',
    heading: 'Растящ, задължителен разход.',
    body: 'Проверката не е по избор — тя е регулаторно изискване за всяка регулирана институция на планетата. Пазарът на инструменти расте все по-бързо.',
    stats: [
      { value: '$206 млрд.', label: 'годишен разход за съответствие срещу финансови престъпления (SAM)' },
      { value: '~$22 млрд.', label: 'RegTech пазар днес (2025) — нашата достъпна ниша' },
      { value: '~$85 млрд.', label: 'прогнозен RegTech пазар до 2035 г., при ~21% CAGR' },
    ],
    note: 'Всеки финтех, банка, платежна компания, крипто борса и инвестиционен фонд е купувач — защото законът ги задължава.',
    sources: ['Precedence Research, RegTech Market (2025)', 'LexisNexis Risk Solutions (2023)'],
  },
  vision: {
    label: 'Накъде продължаваме',
    kicker: 'Накъде продължаваме',
    heading: 'От еднократна проверка към постоянна сигурност.',
    body: 'Приемането на клиенти е входната точка. Същият агент се разширява естествено към целия жизнен цикъл на съответствието.',
    items: [
      {
        t: 'Постоянен мониторинг на контрагенти',
        d: 'Непрекъсната повторна проверка на всяко взаимоотношение и сигнал в момента, в който рискът на субект се промени — затваряйки завинаги пропуска с „неактуализирани досиета“.',
      },
      {
        t: 'По-задълбочено проучване',
        d: 'По-богато разпознаване на субекти, анализ на мрежи и действителни собственици (UBO) и по-широко покритие на източници за разширена проверка при висок риск.',
      },
    ],
  },
  closing: {
    label: 'Заключение',
    title1: 'Спрете ръчните проверки.',
    title2: 'Започнете да решавате.',
    subtitle:
      'Заменете 45-минутна ръчна проверка с готов за одит доклад за секунди — без човешка грешка и с приложени доказателства.',
    cta: 'Изпробвайте Clavis на живо',
    contact: 'clavis.ai · hello@clavis.ai',
  },
};

export const content: Record<Locale, PresentationContent> = { en, bg };
