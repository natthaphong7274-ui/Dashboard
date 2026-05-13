# Dashboard Improvement Phase Notes

This file records what each implementation branch is intended to contain.

## codex/phase-0

Base stability work for the dashboard UI.

- Adds shared UI state helpers for loading, empty, and error states.
- Starts replacing ad hoc inline loading/error HTML in core dashboard flows.
- Adds the dashboard watermark container.
- Shows watermark details after login/session validation.
- Updates watermark timestamp every minute.
- Hides watermark on logout or session expiry.
- Keeps business logic and Google Sheet structure unchanged.

Primary files:

- `src/Scripts.html`
- `src/Body.html`
- `src/Styles.html`

Validation performed:

- JavaScript syntax check for all script blocks in `src/Scripts.html`.
- `git diff --check`.

## codex/phase-1

Security and resilience work built on top of `codex/phase-0`.

- Adds central server-side permission helpers:
  - `_requireSession`
  - `_requireRole`
  - `_canAccessZone`
  - `_canAccessRow`
  - `_requireRowAccess`
- Requires a valid session for core data loading.
- Filters Tracking and Growth Tracking data by role and zone.
- Blocks Tracking and Growth Tracking saves outside the user's permitted zone.
- Keeps Director access unrestricted where expected.
- Adds `PERMISSION_DENIED` audit logging for blocked actions.
- Converts Director-only Settings actions to use the shared guard helpers.
- Strengthens frontend escaping for key dashboard table rendering.
- Adds CSV export guard requiring an active session.
- Adds CSV metadata watermark:
  - `Internal Use Only`
  - exported by
  - role
  - scope
  - generated time
- Escapes CSV cells safely.
- Replaces `Math.random()` token generation with `Utilities.getUuid()`.
- Validates token format before reading session data.
- Logs malformed token attempts as `INVALID_TOKEN_FORMAT`.

Primary files:

- `src/Auth.js`
- `src/DataReader.js`
- `src/Settings.js`
- `src/Tracking.js`
- `src/Scripts.html`

Validation performed:

- JavaScript syntax check for server-side files touched in Phase 1.
- JavaScript syntax check for all script blocks in `src/Scripts.html`.
- `git diff --check`.

## Notes

- No Google Sheet structure changes are included.
- No new Tracking, Target, Login, or New Agent system is introduced.
- The detailed execution plan lives in:
  - `docs/dashboard_improvement_execution_playbook.docx`
  - `docs/dashboard_improvement_execution_playbook.pdf`
