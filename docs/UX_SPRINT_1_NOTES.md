# UX Sprint 1 Notes

Branch: `UX_Sprint-1`

## Scope

Reorganized the dashboard navigation so users can distinguish page navigation, work modules, and system actions faster.

## Changes

- Grouped top navigation into `Main` and `Work` sections.
- Moved `Tracking` into the main navigation path by opening the existing tracking summary action.
- Added `Report Center` to the work module group.
- Kept refresh, last updated, auto polling badge, user management, and logout in the system action area.
- Moved `User Management` out of the page/module nav and kept it visible only for Director users.
- Added a `swMain('usermgmt')` guard so non-Director users cannot open the user management page through direct function calls.
- Reset the user management system action visibility on logout.

## Files Touched

- `src/Body.html`
- `src/DesignV2.html`
- `src/Styles.html`
- `src/Scripts.html`

## Verification

- `git diff --check` passed with only Windows LF/CRLF warnings.
- Inline script syntax check passed for 5 script blocks in `src/Scripts.html`.

## Manual Testing Still Needed

- Log in as BD and confirm `User Management` is hidden.
- Log in as AM and confirm `User Management` is hidden.
- Log in as Director and confirm `User Management` appears in the system action area.
- Check desktop sidebar/topbar layout.
- Check mobile navigation grouping.
- Confirm `Tracking`, `Report Center`, refresh, auto badge, and logout still work.
