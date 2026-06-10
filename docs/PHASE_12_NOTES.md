# Phase 12 Notes: Login Loading Final Polish

Branch: `phase-12_login-loading-final-polish`

Base commit: `0d0f8d6`

## Scope

Phase 12 starts after Phase 11 closure. The goal is presentation readiness: clearer system naming, cleaner login/loading states, final UI polish, QA notes, and delivery documentation.

## What Changed So Far

- Renamed the product surface from `Dashboard Realtime` to `Customer Insight Dashboard`.
- Updated the Apps Script document title to match the new system name.
- Reworked login and splash copy around customer insight, role scope, and follow-up signals.
- Updated loading text to explain the actual preparation flow:
  - role scope
  - customer signals
  - follow-up data
  - map readiness
- Added compact splash/home loading step chips so loading states feel purposeful instead of generic.
- Replaced the static splash loading card with a game-like progress loader:
  - dashboard-themed data-route/grid background
  - restrained moving packet effects across route lines
  - loading percentage
  - stage label
  - segmented progress rail with scan highlight
  - active/done loading step states
- Added a compact Desert Horse loading mini game:
  - runs only while the splash loader is visible
  - `Space` / `ArrowUp` jumps, `ArrowDown` ducks, `B` triggers a short boost
  - stops automatically when the splash screen is hidden
- Tuned the splash palette back to the dashboard system tokens (`--bg`, `--cd`, `--pr`, `--ac`, `--bd`) so loading feels like part of the app instead of a separate game screen.
- Added simulated splash progress during `loadData()` and force-refresh, capped before completion and finalized at 100% when the workspace is ready.
- Rebuilt the Director unlock section as a contained disclosure inside the login card.
  - Added the missing Director username/password fields expected by `doDirectorUnlock()`.
  - Kept the locked-user target field and unlock action inside the same compact card.
- Tightened the login layout so desktop uses a fixed two-column app shell and mobile falls back to one column.
- Replaced the busy parcel/3D-style login animation with interactive mouse-tracking eyes from the provided reference.
  - Adapted the six reference color moods into dashboard-safe variants.
  - Randomizes both the eye color and eye shape every time the login overlay is shown.
  - Removed the old left-side login copy/status entirely and replaced that area with the provided eye interaction.
  - Resized and centered the visual so it fits the left panel without pushing the sign-in form.
- Redesigned the full login screen around the product register:
  - lightweight access/watch visual on the left
  - compact secure access form on the right
  - role scope/auth/customer signal chips
  - no 3D or Three.js runtime on the login surface
  - responsive fallback puts the sign-in form first so the preview never pushes login out of the first view

## Guardrails Kept

- Raw KPI sheets were not changed.
- Export/download/report disabled paths were not restored.
- Role permissions and masking were not loosened.
- Phase 11 tracking/follow-up logic was not refactored.

## Validation

- Backend Apps Script parse passed for `Tracking.js`, `DataReader.js`, `Auth.js`, `Settings.js`, `Constants.js`, and `Config.js`.
- Inline scripts in `Scripts.html` parse passed.
- `git diff --check` passed with LF-to-CRLF normalization warnings only.
- Rename search confirms `Dashboard Realtime` only remains in this note as historical context.

## Next Step

- Continue responsive visual QA for login/loading once a deployed/local preview target is available.
- Continue final UI polish pass across dense dashboard panels.
