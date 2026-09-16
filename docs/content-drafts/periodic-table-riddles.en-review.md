# English riddles: editorial review record

Status: **done — content review and local implementation checks complete.** Publication and translation are deferred by the user.

Content version: `en-v1`
Review date: 2026-09-16
Article: [periodic-table-riddles.en.md](./periodic-table-riddles.en.md)

This is an internal record. Do not publish these notes as article body copy.

## Scope and review method

- 12 newly written fixed examples: four Easy, four Intermediate, four Challenge.
- Article includes introduction, instructions, section navigation, answers, explanations, solving method, CTA, references, and proposed SEO metadata.
- No daily target, game state, user input, or third-party riddle collection was used to write the questions.
- Factual properties were read from the linked RSC pages; these are references for facts, not copied question wording.
- Structural clue combinations were checked against all 118 records in `data/atom.json`. Non-structural clues and relevant comparison elements were checked against external references.
- Source review and editorial checks were performed by the drafting assistant. No independent chemistry expert or classroom review has been performed. Difficulty is an editorial label, not a measured learner level.
- The English page has now been implemented and checked locally; see the implementation record in [the page plan](../periodic-table-riddles-plan.md). Production deployment, live-site validation, and translation have not been performed.

## Per-question review

All sources below were checked on 2026-09-16. Candidate scope is all 118 elements unless the question explicitly narrows it.

| Stable ID | Answer | Decisive clue check | Additional facts and source | Localization notes |
| --- | --- | --- | --- | --- |
| riddle-01 | Argon, Ar, 18 | Group 18 + period 3 leaves Ar | [RSC Argon](https://periodic-table.rsc.org/element/18/argon): location and shielding atmosphere in welding | Translate noble gas consistently; avoid claiming complete chemical inertness |
| riddle-02 | Carbon, C, 6 | Group 14 + period 2 leaves C | [RSC Carbon](https://periodic-table.rsc.org/element/6/carbon): diamond, graphite, pencil use | Define allotrope; pencil cores are not described as pure carbon |
| riddle-03 | Sodium, Na, 11 | Alkali metal + period 3 leaves Na | [RSC Sodium](https://periodic-table.rsc.org/element/11/sodium): group and sodium chloride; [OpenStax ionic compounds](https://openstax.org/books/chemistry-2e/pages/2-6-ionic-and-molecular-compounds): ions in NaCl | Preserve compound-versus-element distinction; symbol remains Na |
| riddle-04 | Calcium, Ca, 20 | Group 2 + period 4 leaves Ca | [RSC Calcium](https://periodic-table.rsc.org/element/20/calcium): location and calcium phosphate in bones/teeth | Keep alkali and alkaline earth distinct |
| riddle-05 | Oxygen, O, 8 | Period 2 + even atomic number gives Be/C/O/Ne; gas gives O/Ne; not noble gives O | [RSC Oxygen](https://periodic-table.rsc.org/element/8/oxygen), [Beryllium](https://periodic-table.rsc.org/element/4/beryllium), [Carbon](https://periodic-table.rsc.org/element/6/carbon), [Neon](https://periodic-table.rsc.org/element/10/neon): numbers and states | Preserve mathematical meaning of even; use O₂, not an isolated O atom, for ordinary gas |
| riddle-06 | Bromine, Br, 35 | Group 17 + period 4 leaves Br | [RSC Bromine](https://periodic-table.rsc.org/element/35/bromine): liquid at 20°C, appearance, melting/boiling points | Preserve temperature and pressure; no handling instruction |
| riddle-07 | Silicon, Si, 14 | Carbon's group 14 + next period 3 leaves Si | [RSC Silicon](https://periodic-table.rsc.org/element/14/silicon) and [Carbon](https://periodic-table.rsc.org/element/6/carbon): positions and semiconductor use | Do not confuse silicon with silicone; below means same group |
| riddle-08 | Copper, Cu, 29 | 28 < Z < 31 gives Cu/Zn; group 11 leaves Cu | [RSC Copper](https://periodic-table.rsc.org/element/29/copper) and [Zinc](https://periodic-table.rsc.org/element/30/zinc): numbers/groups; copper appearance and wiring | Preserve strict inequalities; wiring is confirmation, not sole identification |
| riddle-09 | Hydrogen, H, 1 | Group 1 + nonmetal leaves H; gas agrees | [RSC Hydrogen](https://periodic-table.rsc.org/element/1/hydrogen) and [OpenStax periodic table](https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table): placement and nonmetal classification | Retain “standard table”; some alternative table layouts place hydrogen differently |
| riddle-10 | Helium, He, 2 | Group 18 + s-block leaves He; neutral atom with 2 electrons independently confirms Z = 2 | [RSC Helium](https://periodic-table.rsc.org/element/2/helium): group, block, 1s² | Keep “neutral” and electron-configuration convention; do not teach every group 18 element as p-block |
| riddle-11 | Gallium, Ga, 31 | Group 13 + Z < 40 gives B/Al/Ga; metal gives Al/Ga; 20°C < melting point < 35°C leaves Ga | [RSC Gallium](https://periodic-table.rsc.org/element/31/gallium): 29.7646°C; [Aluminium](https://periodic-table.rsc.org/element/13/aluminium): 660.323°C; [OpenStax periodic table](https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table): boron is a metalloid | Preserve atomic-number bound, equilibrium, and pressure qualifiers |
| riddle-12 | Cobalt, Co, 27 | Period 4 + Z < 28 + mass > 58.693 leaves Co | [RSC Cobalt](https://periodic-table.rsc.org/element/27/cobalt), [Nickel](https://periodic-table.rsc.org/element/28/nickel), plus earlier period 4 fact boxes: 58.933 > 58.693 | Use relative atomic mass, not mass number; not a claim about every individual isotope |

## Data limitations and publication notes

- Local `phase-at-stp` is not a 20°C field. Local filtering is a candidate cross-check only; stated temperatures were checked separately in RSC fact boxes. Do not reuse this field as proof for arbitrary temperatures.
- Local bromine type is `ReactiveNonMetal`, not a dedicated halogen category. The clue uses group 17, avoiding dependence on that label.
- RSC rounds some masses differently from local data, for example argon (39.95 versus 39.948) and helium (4.003 versus 4.0026). Neither value is a deciding clue in those questions. Cobalt/nickel comparison agrees at the precision used.
- RSC gives helium's melting point as unknown in its fact box; local data includes a melting-point value without a pressure qualifier. No helium melting clue is used, and no game data has been changed.
- Gallium requires a carefully qualified state statement because supercooling is possible. If the challenge is too technical for the intended audience, simplify the question during a later editorial revision instead of silently removing its conditions.
- Relative atomic mass, proton/electron definitions, and the periodic-table organization should retain their explanatory wording in translations.
- Article links to game routes are intended destinations consistent with the local route structure; check actual deployed destinations before web publication.
- The document's HTML `details` elements organize answers for Markdown readers. The website's keyboard access, mobile layout, and server-rendered content have been checked locally; see the page plan for results.

## Checklist

- [x] 12 distinct IDs and 12 different answers.
- [x] Four questions per editorial difficulty level.
- [x] Original clue wording and explanations.
- [x] Sources and review date recorded.
- [x] Structured candidate checks and external fact checks completed.
- [x] Temperature, group/block exceptions, compound wording, and localization reviewed.
- [x] SEO title/description and reader-facing article sections present.
- [ ] Independent subject-matter or learner review, if commissioned.
- [x] Website implementation and local checks; production deployment remains pending.
- [x] All 13 locale entry points share the English guide; all 12 non-English guide paths redirect to it.
- Publication: **deferred** — user explicitly requested local changes only, with no commit, push, or deployment.
- Translation: **deferred** — user chose shared English content.
- Live-site verification: **todo** after a separately requested deployment.
