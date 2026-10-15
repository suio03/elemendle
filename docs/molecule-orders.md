# Molecule composition practice

## Availability

Temporarily hidden pending user feedback. The practice hub shows challenges and
classic practice only. `/practice/molecules` temporarily redirects to the localized
practice hub. The implementation, translations and saved learning data are retained.
No feedback form has been connected yet; its destination still needs to be selected.

## Retained prototype

Practice has three entries: `/practice/challenges`, `/practice/molecules`, and
`/practice/classic`. Molecules now focuses on learning composition rather than
retaining three molecules from a shared atom inventory.

## Learning flow

- Learn: build water, carbon dioxide and methane with the formula visible.
  Explain subscripts and the implied count of one.
- Practice: recall the same compositions from their names. Formula hints are optional.
  Current-target records hide their formula until the answer is revealed.
- Compare: build water and hydrogen peroxide and compare their oxygen counts.
- Explore: freely combine H, O, C and N (up to 12 atoms per model), then identify
  matches from the existing 12-molecule catalog.
- Wrong target answers explain the missing or excess count for each element.
  Correct answers explain composition. Unrecognized exploration compositions are
  not declared chemically impossible. Bond structures and reactions are not simulated.
- Stages can be selected directly. Correct guided answers unlock Continue.
- Clearing an unfinished model preserves attempts and hint usage for that question.
  Clearing an exploration model preserves the learning record, explicitly labeled
  separately from the current model. There is no consumable inventory or completion goal.

## Records, compatibility and analytics

`lib/molecule-learning.ts` owns the versioned learning state. `seenIds` records
successful practice or exploration. `independentIds` records compositions answered
correctly on the first attempt without a formula hint in Practice. This is labeled
as a past independent answer, not mastery. Retrying or using a hint does not qualify.

Learning sessions persist inside the existing optional `moleculeOrders` backup data.
Legacy order and exploration state is preserved for backup compatibility and does
not automatically become a learning record. Importing a legacy backup without
learning state preserves current learning state. Other practice modes remain unchanged.
Storage failure allows the current in-memory session to continue with a warning.

Analytics adds `molecule_learning_checked`, `molecule_learning_hint`, and
`molecule_learning_stage`, alongside the existing molecule page-open event.
Checks include stage, question number, attempt count, correctness and hint usage.
Historical order and exploration event definitions remain available.

## Verification and preview

Run `npm test`, `npm run lint`, `npm run build`, and `npm run build:cloudflare`
with Node 22.16.0. Tests cover learning progression, feedback, first-attempt records,
hint persistence, exploration, backup compatibility and interactive flows in jsdom.
Legacy rule tests protect retained backup data. jsdom does not verify visual layout.

For local preview, use `npm run start -- --hostname localhost --port 3100` after
building. Open `http://localhost:3100/ch/practice/molecules` for Chinese.
