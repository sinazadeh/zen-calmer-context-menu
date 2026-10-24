# Privileged settings-page operations

## External links

The settings page has a system principal, but it cannot navigate a newly
opened content tab to an ordinary web URL with `<a target="_blank">`: the tab
stays blank. External links call an allowlisted method on
`window.ZenContextMenu`, which opens them through the browser window's
`openTrustedLinkIn`; keep the anchor as the fallback for the standalone sample
page. Only pass fixed, mod-authored URLs to that method. Content- or
user-provided URLs require `openWebLinkIn` instead.

## Backups

The Backup card exports `makeBackup()` (in `menus.js`): `format`, `version`,
the hidden and folded keys and the `uc.*` style options (the icon style as its
string); the macOS native-menus preference is the browser's and stays out. A
backup without `folded` (made before it existed) folds nothing.

A chrome:// page can't download with `<a download>`, so export goes through
`nsIFilePicker` and `IOUtils`. An imported file is untrusted: `parseBackup()`
takes only string keys (canonicalized), booleans for known options and listed
values for options with choices, refuses other files and newer versions, and
the page asks before replacing anything. Raise `BACKUP_VERSION` only for a
change older versions would misread, and add a test in
`tests/menus.test.mjs`.
