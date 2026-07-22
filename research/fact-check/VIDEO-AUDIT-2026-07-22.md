# Published chapter video audit — 22 July 2026

Scope: every video embedded in the fifteen published long reads from 2004–05 through 2018–19, with frame-level review of the seven replacements.

Method: resolve the exact current YouTube ID with `yt-dlp`; record `availability`, `playable_in_embed`, `age_limit`, duration, channel and live title; compare `youtubeId` with the linked `href`; inspect the current thumbnail, opening frames and sampled event frames for identity, legibility, contrast, caption coverage and duplication against the chapter photographs. The hard runtime ceiling is twelve minutes; the editorial preference is two to eight minutes.

## Current 15-video inventory

| Season | ID | Runtime | Channel | Live title | Transport result |
|---|---|---:|---|---|---|
| 2004–05 | `j9ihJMqZGD0` | 1:26 | FC Barcelona | Messi's first official goal for FC Barcelona | VERIFIED |
| 2005–06 | `KSMZ_ghfWfo` | 9:27 | MM Comps | Messi vs Chelsea● 2005-06 UCL Away | VERIFIED / QUALIFIED: above the preferred range, below the ceiling. |
| 2006–07 | `VTHLvdM1sXU` | 1:29 | FC Barcelona | The first of many: Messi’s debut hat-trick for FC Barcelona | VERIFIED |
| 2007–08 | `Dqevl3w0_6s` | 6:43 | Olympic Games | Lionel Messi 🇦🇷 at the Olympics! \| Athlete Highlights | VERIFIED |
| 2008–09 | `1HZLAPyjW6w` | 6:38 | FC Barcelona | REAL MADRID 2-6 BARÇA \| Match highlights 2008/09 | VERIFIED |
| 2009–10 | `-kWIh_9sVT8` | 5:43 | TNT Sports Football | Lionel Messi, Barcelona vs Arsenal (2010) Champions League classic displays | VERIFIED |
| 2010–11 | `-nj-Y9tJ_Qc` | 2:11 | CBS Sports Golazo | 50 Great UCL Moments: Lionel Messi's Solo Run vs. Real Madrid in 2011 \| CBS Sports Golazo | VERIFIED |
| 2011–12 | `L0OifOdSdjw` | 3:35 | TNT Sports Football | Lionel Messi, Barcelona v Bayer Leverkusen (2012) Champions League classic displays | VERIFIED |
| 2012–13 | `LDM3KITy-TI` | 5:10 | FC Barcelona | FC Barcelona vs AC Milan 4 0 | VERIFIED / QUALIFIED: correct match, but visibly recycled broadcast footage. |
| 2013–14 | `ku9vBsRYBZE` | 7:25 | LALIGA | Resumen \| Highlights Real Madrid (3-4) FC Barcelona … EL CLÁSICO | VERIFIED |
| 2014–15 | `nHAjktNg6fo` | 1:58 | CBS Sports Golazo | Lionel Messi Destroys Bayern's Jerome Boateng in 2015 UCL Semifinal \| CBS Sports Golazo | VERIFIED |
| 2015–16 | `4PQZDBOV34k` | 2:02 | FC Barcelona | MESSI & SUAREZ MAGICAL CRUYFF STYLE PENALTY | VERIFIED |
| 2016–17 | `h4m68r8kWAc` | 4:56 | FC Barcelona | FC BARCELONA 6-1 PSG \| Match highlights | VERIFIED |
| 2017–18 | `xwAwuUfwDxs` | 5:18 | TNT Sports Football | Champions League Highlights: Barcelona 3-0 Chelsea | VERIFIED |
| 2018–19 | `buoMlAshKXQ` | 3:04 | Liverpool FC | Reds complete miracle comeback against Barca: Liverpool 4-0 Barcelona \| Champions League | VERIFIED |

All fifteen live records returned `availability=public`, `playable_in_embed=True`, a runtime at or below 12:00 and `age_limit=0`. All fifteen `href` query IDs exactly match their `youtubeId`; there is no exact-ID duplication.

## Seven replacements

| Season | Identity, thumbnail and sampled content | Caption and duplication | Decision |
|---|---|---|---|
| 2009–10 | TNT's 5:43 Arsenal quarter-final edit; clear, event-specific Messi thumbnail. Sampled frames contain all four Messi goals. | Caption accurately describes the four finishes. No substantial duplication of either chapter photograph. | VERIFIED |
| 2010–11 | CBS's 2:11 Madrid semi-final feature; clear thumbnail identifies Messi's solo run. Frames contain Busquets's short touch, the run, finish and replays. | Caption accurately describes the passage and stage. No substantial photo duplication. | VERIFIED |
| 2011–12 | TNT's 3:35 Leverkusen edit; clear, event-specific thumbnail. Frames contain all five goals, including both feet and the chipped finishes. | Caption accurately describes the clip. No substantial photo duplication. | VERIFIED |
| 2012–13 | FC Barcelona's 5:10 Milan comeback upload; correct scoreboard, match and four-goal sequence. The thumbnail is legible and match-specific but shows the crowd rather than Messi, and both it and the footage retain Arabic-broadcast plus `Official Kora Book` / `l10nelandresmessi` watermarks. | The caption accurately foregrounds the two early Messi goals without claiming those are the clip's entire contents. It does not duplicate either chapter photograph. | QUALIFIED: correct and usable, but notably weaker visual/provenance quality than the other replacements. |
| 2013–14 | LALIGA's 7:25 Bernabéu highlights; correct teams, match and 3–4 sequence. Thumbnail is recognizable and sufficiently contrasted. | Caption correctly names Iniesta's opener and Messi's hat-trick. No substantial photo duplication. | VERIFIED |
| 2014–15 | CBS's 1:58 Bayern semi-final feature; high-contrast thumbnail and frames identify the Boateng turn and chipped finish. | Caption accurately describes the featured goal. No substantial photo duplication. | VERIFIED |
| 2018–19 | Liverpool's 3:04 Anfield highlights; clear, high-contrast match graphic. Frames contain Origi's two goals, Wijnaldum's two and the quick corner. | The corrected “Three minutes” caption accurately describes the runtime and event; no chapter photo is duplicated. | VERIFIED |

## Automated publication gate

`npm run videos:check` passes all fifteen records after the corrections. Static inspection confirms that `scripts/check-videos.mjs` exits non-zero when `yt-dlp` cannot resolve a video, when `availability` is not exactly `public`, when `playable_in_embed` is not exactly `True`, when duration exceeds 720 seconds, or when the parsed `age_limit` is greater than zero. `package.json` places this command first in the `deploy` chain with `&&`, so each of those failures prevents build/deployment.

The gate now prints, parses and tests `age_limit`, implementing the protocol's age-restriction condition. Every currently selected video reports `age_limit=0`.

## Outcome

- Transport state: **15/15 VERIFIED** as public, embeddable and no longer than twelve minutes; **15/15** also currently report no age restriction.
- Replacement-media review: **6 VERIFIED, 1 QUALIFIED, 0 INCORRECT**.
- Seven clips were replaced: five non-embeddable uploads, one 101:54 full match and one 10:34 edit.
- Exact asset duplication: none. Substantial thumbnail/chapter-photo duplication: none.
- Verdict: **PUBLISH**. Both prior HOLD items are resolved. The accepted 2012–13 visual-quality qualification is non-blocking: the clip is accurate, official-channel-hosted, public, embeddable and substantially shorter than the replaced edit.
