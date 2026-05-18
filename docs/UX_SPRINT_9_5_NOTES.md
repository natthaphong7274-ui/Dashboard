# UX Sprint 9.5 Notes

Branch: `UX_Sprint-9.5`

## Scope

Changed the Home Map Focus side metrics from month-to-date totals to daily average pace metrics, so Director, AM, and BD users can read today's operating pace without mentally normalizing MTD values.

## UX Rationale

The Map Focus panel is a decision surface for "what should move today." MTD totals are useful for monthly reporting, but they can be misleading in a daily command view because they grow with the calendar. `Avg Rev/day` and `Avg Vol/day` align better with the screen context `Avg / Day-1`, target pace, escalation, and follow-up decisions.

## Changes

- Replaced `Revenue MTD` with `Avg Rev/day` in Map Focus stats.
- Replaced `Volume MTD` with `Avg Vol/day` where the map side panel shows volume.
- Calculated current daily averages using the current MTD value divided by elapsed days (`TODAY_DATE - 1`, with a minimum divisor of 1).
- Compared daily averages against the previous month's daily average instead of comparing raw MTD totals.
- Updated side stat subtext to use `vs prev avg` when previous-month data is available.
- Kept existing tone behavior conceptually the same: negative daily-average movement still warns or marks danger.

## Surfaces Updated

- Director `Country focus`: now shows `Avg Rev/day` and `Avg Vol/day`.
- AM `Zone focus`: now shows `Avg Rev/day` in place of `Revenue MTD`.
- BD `Today queue`: now shows `Avg Rev/day` and `Avg Vol/day`.

## Files Touched

- `src/Scripts.html`

## Verification

- Ran a script-block syntax check against `src/Scripts.html`.
- Confirmed all parsed `<script>...</script>` blocks compile with Node.
- GitHub branch pushed: `UX_Sprint-9.5`.

## Manual Testing Still Needed

- Open Director Home and confirm `Country focus` shows daily averages, not MTD totals.
- Open AM Home and confirm `Zone focus` label/value spacing still fits.
- Open BD Home and confirm `Today queue` shows both daily average cards correctly.
- Compare values against source data for one month to confirm `MTD / Day-1` matches the UI.
