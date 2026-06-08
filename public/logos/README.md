# Company logos (Why-us slide)

Logo icons named by `slug`, rendered ~16px next to the company name on the team
slide. **PNG** (transparent preferred). If a file is missing, the icon just hides
and the company name still shows — never a broken image.

Current files (provided by the team):
- `n8n.png`         — n8n (pink connected-nodes mark)
- `nexo.png`        — Nexo ("N" mark)
- `talentsight.png` — TalentSight (atom + person)
- `agency.png`      — Mario's agency (octopus)
- `tuktam.png`      — Tuk-Tam (seal)

> If any logo↔company mapping is wrong, just overwrite the file with the same
> name — no code change needed. Slugs are set in `lib/presentation/content.ts`
> (`team.members[].companies[].slug`).

## Competitors (positioning-matrix slide)
Not used yet — the matrix renders text labels. To add competitor logos, extend
the matrix render in `components/PresentationDeck.tsx`.
