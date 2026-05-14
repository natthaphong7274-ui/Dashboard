# UX Sprint 2 Notes

Branch: `UX_Sprint-2`

## Scope

Clarified key metric labels and added reusable metric help so BD, AM, and Director users can understand calculations without asking a developer.

## Changes

- Added reusable metric helper functions in `src/Scripts.html`.
- Added `?` help affordances with accessible labels and browser-native tooltips.
- Connected metric help to overview KPI cards.
- Connected metric help to Home command metrics, signal strip metrics, and map command stats.
- Connected metric help to Avg Rev per piece and Avg Vol per day section summary cards.
- Reworded the main confusing overview metric from `SUM Avg Rev` to `Avg Rev/day`.
- Changed the top KPI subtitle from `SUM Avg Rev/Day` to the clearer formula text `Revenue ÷ days`.

## Metric Definitions Covered

- `MTD`: accumulated value from the start of the selected month through the latest available data date.
- `Avg Rev/day`: Revenue divided by the selected month day divisor.
- `Avg Vol/day`: Volume divided by the selected month day divisor.
- `Avg Rev/ชิ้น` / `Avg Rev/Vol`: Revenue divided by Volume.
- `Avg Rev/Agent`: Revenue divided by active agents in the current scope.
- `Target pace`: progress against the configured monthly target using current revenue and remaining days.

## Files Touched

- `src/Body.html`
- `src/DesignV2.html`
- `src/Scripts.html`
- `src/Styles.html`

## Manual Testing Still Needed

- Hover or focus `?` on overview KPI cards.
- Check Home for BD, AM, and Director and confirm metric help appears where labels are used.
- Confirm the Avg Rev/ชิ้น and Avg Vol/วัน section still renders.
- Confirm no chart or KPI formula changed unexpectedly.
- Check mobile layout so help icons do not wrap awkwardly.
