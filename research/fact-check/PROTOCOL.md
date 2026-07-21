# Floodlight Fact Desk protocol

## Purpose and scope

This desk verifies published factual material independently of prose editing. It audits every checkable assertion in season metadata, titles/deks, body copy, source lists, honour displays, captions, alt text, credits, outbound URLs and audiovisual embeds. It never silently changes publication copy.

## Evidence standard

1. Prefer contemporaneous official records: competition match reports, federation records, club match sheets, annual reports and medical notices.
2. Then use later first-party retrospectives (club, FIFA, UEFA) and contemporary reputable reporting.
3. Use specialist databases only as corroboration. Do not use unsourced aggregators to settle a conflict.
4. Quotations require a traceable speaker, occasion and source. Paraphrase presented as quotation fails.
5. A photo proves only what is visible. Identity, date, venue and credit require provenance from the publisher/archive.
6. Record meaningful conflicts; do not select a convenient figure without explaining the counting rule.
7. Access checks prove reachability, not truth or reuse rights. HTTP status was checked on 2026-07-21.

## Status vocabulary

- `VERIFIED`: directly supported by a strong source, with no material conflict.
- `QUALIFIED`: substantially true but imprecise, interpretive, dependent on a counting convention, or needing narrower wording.
- `UNRESOLVED`: plausible, but available evidence is insufficient or conflicting.
- `REMOVE`: contradicted, materially misleading, falsely attributed, or unsuitable to publish as fact.

Confidence is `HIGH`, `MEDIUM` or `LOW`; it measures evidence strength, not editorial importance.

## Audit procedure

1. Freeze the audited revision (`git rev-parse HEAD`) and identify every rendered claim surface.
2. Split prose into atomic claims. Keep closely coupled match facts together only when one official report proves all of them.
3. Search primary sources first. Open the underlying page/PDF and record the exact fact supported.
4. Triangulate dates, score, stage, venue, line-up, substitutions, goals/cards and injury details where practical.
5. Separate objective fact from scene-setting or interpretation. Mark interpretation `QUALIFIED` unless it embeds a false factual premise.
6. Inspect every image itself; compare visible content with alt/caption. Check credit and landing-page provenance separately.
7. Resolve every URL and list repeated exact media URLs. A source URL reused as its media `href` is not a duplicated asset.
8. Record issues in the season ledger and summarize only consequential findings. Corrections happen in a separate editorial pass.

## Editorial firewall

- Evidence belongs in the ledger and source notes, not in the narrative voice. Avoid constructions such as “UEFA states”, “records show”, “the photograph proves” or “the footage shows” when the underlying event can be narrated directly.
- Name a governing body, publication, photograph or film in the prose only when its institutional action, contemporary framing or visual object is itself part of the story.
- Translate verified evidence into natural chronology and observed action. Keep attribution unobtrusive in the source list, caption or linked credit.
- Before publication, search the chapter for evidentiary throat-clearing (`according to`, `records show`, `reported`, `the image shows`, governing-body attribution) and rewrite any phrase that makes the article sound like its audit ledger.

## Season boundary and statistics rules

- European club seasons run from the first official club fixture through the last official club fixture, unless the page explicitly uses another convention.
- Summer internationals after the club season are contextual material, not honours won in that club season.
- Club appearances/goals include official first-team competition only. Friendly and reserve appearances are excluded.
- Assists are methodology-dependent unless an official competition record defines them; always name the provider/counting rule.
- Goal minutes follow the official match report. Describe `90+1` as stoppage time, not simply the 90th minute where precision matters.

## Ledger template

| ID | Surface | Published claim | Status | Confidence | Evidence / conflict | Source |
|---|---|---|---|---|---|---|
| YYYY-NN | prose / metadata / honour / image / video / URL | Atomic claim | VERIFIED / QUALIFIED / UNRESOLVED / REMOVE | HIGH / MEDIUM / LOW | What the evidence proves and any limitation | Direct URL(s) |

Each ledger ends with URL health, media-duplication results, quotations, and a status count.
