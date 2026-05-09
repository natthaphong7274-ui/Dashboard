# clasp workflow

This project can be synced to Google Apps Script with `clasp`.

## One-time setup

1. Install Node.js with npm if this machine does not have `npm`.
2. Install clasp:

```powershell
npm install -g @google/clasp
```

3. Enable the Apps Script API:

https://script.google.com/home/usersettings

4. Login:

```powershell
clasp login
```

5. Create local clasp config from the Apps Script project ID:

```powershell
.\tooling\clasp-init.ps1 -ScriptId YOUR_SCRIPT_ID
```

The script creates `.clasp.json` with `"rootDir": "src"`, so only files in `src` are synced.

## Daily use

Pull the latest code before editing:

```powershell
.\tooling\clasp-pull.ps1
```

Push local changes to Apps Script:

```powershell
.\tooling\clasp-push.ps1
```

Open the Apps Script editor:

```powershell
.\tooling\clasp-open.ps1
```

Check setup:

```powershell
.\tooling\clasp-doctor.ps1
```

## Notes

- `.clasp.json` contains the project Script ID. Keep it local unless the repository is private.
- `clasp push` updates the Apps Script project from local files.
- The V2 UI uses `Index_v2.html` and `DesignV2.html`; `Auth.gs` chooses V2 by default and supports `?ui=classic` for the old UI.
