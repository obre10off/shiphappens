// lib/sanctions/countries.ts
// Display-name → ISO-3166-1 alpha-2 (lowercase) for the /match `country` property.
// Covers the form's COUNTRIES list; falls back to the raw input lowercased.

const MAP: Record<string, string> = {
  afghanistan: 'af', albania: 'al', algeria: 'dz', argentina: 'ar', armenia: 'am',
  australia: 'au', austria: 'at', azerbaijan: 'az', bahrain: 'bh', belarus: 'by',
  belgium: 'be', brazil: 'br', bulgaria: 'bg', canada: 'ca', china: 'cn',
  colombia: 'co', croatia: 'hr', cyprus: 'cy', 'czech republic': 'cz', czechia: 'cz',
  denmark: 'dk', egypt: 'eg', estonia: 'ee', finland: 'fi', france: 'fr',
  georgia: 'ge', germany: 'de', greece: 'gr', hungary: 'hu', india: 'in',
  indonesia: 'id', iran: 'ir', iraq: 'iq', ireland: 'ie', israel: 'il',
  italy: 'it', japan: 'jp', jordan: 'jo', kazakhstan: 'kz', kuwait: 'kw',
  latvia: 'lv', lebanon: 'lb', lithuania: 'lt', luxembourg: 'lu', malta: 'mt',
  mexico: 'mx', moldova: 'md', netherlands: 'nl', 'new zealand': 'nz', nigeria: 'ng',
  'north korea': 'kp', norway: 'no', pakistan: 'pk', poland: 'pl', portugal: 'pt',
  qatar: 'qa', romania: 'ro', russia: 'ru', 'saudi arabia': 'sa', serbia: 'rs',
  singapore: 'sg', slovakia: 'sk', slovenia: 'si', 'south africa': 'za',
  'south korea': 'kr', spain: 'es', sweden: 'se', switzerland: 'ch', syria: 'sy',
  turkey: 'tr', ukraine: 'ua', 'united arab emirates': 'ae', uae: 'ae',
  'united kingdom': 'gb', uk: 'gb', 'great britain': 'gb',
  'united states': 'us', 'united states of america': 'us', usa: 'us', us: 'us',
  uzbekistan: 'uz', venezuela: 've', vietnam: 'vn',
};

export function toIso2(country: string | undefined | null): string | undefined {
  if (!country) return undefined;
  const key = country.trim().toLowerCase();
  if (!key) return undefined;
  if (MAP[key]) return MAP[key];
  // already an ISO-2 code?
  if (/^[a-z]{2}$/.test(key)) return key;
  return key; // fall back to raw lowercased per spec
}
