// lib/data/datasets.ts
// Human-readable labels + concise explanations for the OpenSanctions dataset
// codes that surface as evidence tags (e.g. `us_sam_exclusions`, `wd_peps`).
// Anything not listed falls back to a prettified version of the raw code.

export interface DatasetInfo {
  label: string;
  description: string;
  /** sanctions = enforcement list · pep = political-exposure list · enrichment = identity data only. */
  kind?: 'sanctions' | 'pep' | 'enrichment';
}

export const DATASETS: Record<string, DatasetInfo> = {
  us_ofac_sdn: {
    label: 'US OFAC SDN',
    description: 'US Treasury list of Specially Designated Nationals — blocked sanctioned persons.',
    kind: 'sanctions',
  },
  us_ofac_cons: {
    label: 'US OFAC Consolidated',
    description: 'US Treasury non-SDN consolidated sanctions list.',
    kind: 'sanctions',
  },
  us_sam_exclusions: {
    label: 'US SAM Exclusions',
    description: 'US federal debarment list — parties barred from government contracts and grants.',
    kind: 'sanctions',
  },
  us_bis_denied: {
    label: 'US BIS Denied Persons',
    description: 'US Commerce Department list of parties denied export privileges.',
    kind: 'sanctions',
  },
  eu_fsf: {
    label: 'EU Sanctions',
    description: 'EU consolidated financial sanctions (asset freezes) list.',
    kind: 'sanctions',
  },
  gb_hmt_sanctions: {
    label: 'UK HMT Sanctions',
    description: 'UK HM Treasury / OFSI consolidated financial sanctions list.',
    kind: 'sanctions',
  },
  un_sc_sanctions: {
    label: 'UN Security Council',
    description: 'United Nations Security Council consolidated sanctions list.',
    kind: 'sanctions',
  },
  ca_dfatd_sema_sanctions: {
    label: 'Canada Sanctions',
    description: 'Canadian autonomous sanctions (SEMA) list.',
    kind: 'sanctions',
  },
  au_dfat_sanctions: {
    label: 'Australia Sanctions',
    description: 'Australian DFAT consolidated sanctions list.',
    kind: 'sanctions',
  },
  ch_seco_sanctions: {
    label: 'Switzerland SECO',
    description: 'Swiss SECO sanctions list.',
    kind: 'sanctions',
  },
  interpol_red_notices: {
    label: 'Interpol Red Notices',
    description: 'Interpol requests to locate and provisionally arrest wanted persons.',
    kind: 'sanctions',
  },
  wd_peps: {
    label: 'PEP register',
    description: 'OpenSanctions register of Politically Exposed Persons — senior public figures and associates.',
    kind: 'pep',
  },
  ann_pep_positions: {
    label: 'PEP positions',
    description: 'Annotated public-office positions used to establish PEP status.',
    kind: 'pep',
  },
  every_politician: {
    label: 'EveryPolitician',
    description: 'Dataset of elected politicians worldwide (identity/role enrichment).',
    kind: 'enrichment',
  },
  everypolitician: {
    label: 'EveryPolitician',
    description: 'Dataset of elected politicians worldwide (identity/role enrichment).',
    kind: 'enrichment',
  },
  wd_categories: {
    label: 'Wikidata categories',
    description: 'Wikidata role/category tags used to enrich an entity (not a risk list).',
    kind: 'enrichment',
  },
  ext_cia_world_leaders: {
    label: 'CIA World Leaders',
    description: 'CIA directory of chiefs of state and cabinet members of foreign governments.',
    kind: 'pep',
  },
  ru_egrul: {
    label: 'Russia Company Registry',
    description: 'Russian unified state register of legal entities (EGRUL).',
    kind: 'enrichment',
  },
  wikidata: {
    label: 'Wikidata',
    description: 'Public knowledge base used to enrich entity identity and roles.',
    kind: 'enrichment',
  },
};

/** Pretty fallback for unknown codes: `us_sam_exclusions` → `Us Sam Exclusions`. */
function prettify(code: string): string {
  return code
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function datasetLabel(code: string): string {
  return DATASETS[code]?.label ?? prettify(code);
}

export function datasetDescription(code: string): string | undefined {
  return DATASETS[code]?.description;
}

/** True if a string looks like a dataset code rather than a URL or free note. */
export function isDatasetCode(s: string): boolean {
  return /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(s);
}

/** A dataset that records actual enforcement (sanctions/debarment/wanted lists). */
export function isSanctionsDataset(code: string): boolean {
  const k = DATASETS[code]?.kind;
  // Unknown codes are treated as sanctions-relevant (better to surface than hide
  // a real enforcement list), but never the known pep/enrichment ones.
  return k === 'sanctions' || k === undefined;
}

/** A low-signal identity/enrichment dataset that shouldn't be shown as a risk tag. */
export function isEnrichmentDataset(code: string): boolean {
  return DATASETS[code]?.kind === 'enrichment';
}
