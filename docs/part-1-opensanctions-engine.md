# Part 1 — OpenSanctions Screening Engine

> **Owner:** _A_  ·  **Priority:** Highest (biggest weight in the final score)
> **Goal:** A reliable, typed `searchSanctions(input)` function backed by the OpenSanctions
> `/match` endpoint, plus the `searchSanctions` agent tool Part 2 will register.

This is the most important signal in the product. Get it correct, fast, and resilient.

---

## 1. Scope

You own everything under `lib/sanctions/`:

```
lib/sanctions/
  client.ts        # low-level HTTP client for api.opensanctions.org
  match.ts         # searchSanctions() — builds query, calls /match, maps response
  map.ts           # raw OpenSanctions entity → SanctionsMatch / SanctionsResult
  tool.ts          # Vercel AI SDK tool wrapper (exported for Part 2)
  match.test.ts    # unit tests (mocked fetch)
  match.live.test.ts # live API test (needs OPENSANCTIONS_API_KEY)
```

You do **not** own the agent, the route, scoring, or UI. You expose two things:

```ts
// the function Part 3's report assembly / Part 2's tool calls
export async function searchSanctions(input: ScreeningInput): Promise<SanctionsResult>;

// the ready-to-register AI SDK tool for Part 2
export const sanctionsTool; // tool({ description, parameters, execute })
```

Both produce the `SanctionsResult` contract from `lib/contracts/types.ts`.

---

## 2. OpenSanctions `/match` endpoint — reference

- **Base URL:** `https://api.opensanctions.org`
- **Endpoint:** `POST /match/{scope}` where `{scope}` is a dataset/collection.
  - Use `default` (all sanctions + PEP + crime lists) as the primary scope.
  - Make it configurable via `OPENSANCTIONS_SCOPE` (`default` | `sanctions` | `bg_omnio_poi`).
  - `bg_omnio_poi` is the Bulgaria persons-of-interest dataset we were given access to —
    support it as an override / secondary query.
- **Auth header:** `Authorization: ApiKey ${OPENSANCTIONS_API_KEY}`
- **Useful query params:** `?algorithm=best&limit=5` (and optionally `threshold`/`cutoff`).

### Request body

```jsonc
{
  "queries": {
    "q1": {
      "schema": "Person",                       // or "Organization" for company
      "properties": {
        "name": ["Viktor Yanukovych"],
        "birthDate": ["1950-07-09"],            // omit if no DoB
        "country": ["ua"],                       // ISO-2 lower; map from display name
        "nationality": ["ua"]
      }
    }
  }
}
```

### Response shape (the bits we use)

```jsonc
{
  "responses": {
    "q1": {
      "results": [
        {
          "id": "Q123...",
          "caption": "Viktor Yanukovych",
          "schema": "Person",
          "score": 0.93,                 // 0..1
          "match": true,                 // boolean, above threshold
          "datasets": ["us_ofac_sdn", "eu_fsf", "un_sc_sanctions"],
          "topics": ["sanction", "role.pep"],
          "properties": { "birthDate": ["1950-07-09"], "country": ["ua"] }
        }
      ],
      "total": { "value": 1 }
    }
  }
}
```

> ⚠️ Verify field names against the live response during hour 1 — print one raw response and
> adjust `map.ts`. Treat `topics` as the source of truth for PEP / sanction classification.

---

## 3. Implementation

### `client.ts`
- Thin wrapper around `fetch` with base URL, `Authorization` header, JSON in/out.
- 10s timeout (`AbortController`), 1 retry on 5xx / network error.
- Throw a typed `OpenSanctionsError` with status + body on non-2xx.

### `match.ts` — `searchSanctions(input)`
1. Map `input.country` (display name → ISO-2; keep a small lookup, fall back to raw).
2. Build the `Person` query; if `input.company` is present, add a **second query** `q2`
   with `schema: "Organization"` and `name: [company]`.
3. POST to `/match/${scope}?algorithm=best&limit=5`.
4. Map every result via `map.ts`.
5. Derive `SanctionsResult` aggregates (see §4).
6. **Never throw to the caller** — on failure return a `SanctionsResult` with empty matches
   and `error` set, so the report still renders (sanctions is required; degrade, don't crash).

### `map.ts`
- `id` → entity id; build `sourceUrl = https://www.opensanctions.org/entities/${id}/`.
- `isSanctioned` = any matched result has a topic starting with `sanction`.
- `isPep` = any matched result has a topic starting with `role.pep` (or `role.pep`).
- `bestScore` = max `score` across results.
- `datasetsHit` = unique union of `datasets` across **matched** results.
- Only count `result.match === true` toward `isPep` / `isSanctioned` / `totalMatches`; keep
  near-misses in `matches[]` (Part 3/Part 4 may show them) but flag `match: false`.

### `tool.ts` — AI SDK tool (handed to Part 2)

```ts
import { tool } from 'ai';
import { z } from 'zod';
import { searchSanctions } from './match';

export const sanctionsTool = tool({
  description:
    'Search the OpenSanctions database (sanctions lists + PEPs) for a person or company. ' +
    'ALWAYS call this first. Returns matches with scores, datasets, and PEP/sanction flags.',
  parameters: z.object({
    name: z.string(),
    dateOfBirth: z.string().optional(),
    country: z.string(),
    company: z.string().optional(),
  }),
  execute: async (args) => searchSanctions(args),
});
```

---

## 4. `SanctionsResult` derivation rules (must match contract)

| Field | Rule |
|-------|------|
| `matches` | all results mapped to `SanctionsMatch` (incl. near-misses) |
| `totalMatches` | count of `match === true` |
| `bestScore` | max `score` (0 if none) |
| `isSanctioned` | any matched result has a `sanction*` topic |
| `isPep` | any matched result has a `role.pep*` topic |
| `datasetsHit` | unique datasets across matched results |
| `scope` | the dataset queried |
| `error` | message string if the call failed; else absent |

These feed the heaviest part of the score (weight 0.60). Part 3 maps:
`isSanctioned` → strongest signal, `isPep` → strong, `bestScore` → graded.

---

## 5. Tests

### Unit (`match.test.ts`, mocked `fetch`)
- [ ] Builds a Person query with name+country; omits `birthDate` when absent.
- [ ] Adds an Organization query when `company` is set.
- [ ] Maps a sanctioned result → `isSanctioned: true`, correct `datasetsHit`.
- [ ] Maps a PEP-only result → `isPep: true`, `isSanctioned: false`.
- [ ] `bestScore` = max across results; near-misses kept with `match: false`.
- [ ] Country display name → ISO-2 mapping (e.g. "Ukraine" → "ua").
- [ ] On 500 / network error → returns `error` set, empty `matches`, never throws.
- [ ] Builds correct `sourceUrl`.

### Live (`match.live.test.ts`, `OPENSANCTIONS_API_KEY` required, skipped otherwise)
- [ ] A known sanctioned figure returns `isSanctioned: true`, `bestScore > 0.8`.
- [ ] A random clean name returns `totalMatches: 0`.
- [ ] Print one raw response to confirm field names.

### Acceptance
- `searchSanctions({ name: '<sanctioned figure>', country: '<c>' })` → `isSanctioned: true`.
- `searchSanctions({ name: 'Asdf Qwerty', country: 'Bulgaria' })` → `totalMatches: 0`.
- p95 latency < 2s.

---

## 6. How to work without the other parts
- Import `ScreeningInput` / `SanctionsResult` from `lib/contracts/types.ts` (Part 3, hour 1).
  If not landed yet, copy the two interfaces locally and delete the copy after the merge.
- You need nothing from Parts 2/4. Part 2 just imports `sanctionsTool`.

## 7. Definition of done
- [ ] `searchSanctions` + `sanctionsTool` exported, typed, resilient.
- [ ] Unit tests green; live test passes with a real key.
- [ ] Returns within the contract; never throws to caller.
- [ ] `OPENSANCTIONS_SCOPE` override works (`default` and `bg_omnio_poi`).
