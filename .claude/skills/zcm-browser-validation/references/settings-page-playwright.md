# Settings page in Playwright

The settings page also runs outside Zen, on `sample.js`'s data, so
[Playwright](https://github.com/microsoft/playwright) can load
`context-menu/settings.html` from disk and screenshot it. Install it ad hoc,
like the other tools (the repository has no `package.json`):

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node scripts/check_settings_page.mjs [--browser=chromium|firefox|webkit] [--out=<dir>]
```

`scripts/check_settings_page.mjs` takes four screenshots (light and dark, wide
and narrow) into `.cache/screenshots/` and fails on a page error, a console
error, a missing heading or tabs, a horizontal scrollbar, or a switch that
doesn't mark its row off and back on. Errors loading `chrome://` icons are
ignored: they only load in Zen. Look at the screenshots after a change to
`settings.css` or `settings.js`.

It can't see what needs Zen's privileges (the real catalog, preferences,
backups, `window.ZenContextMenu`) or the menus themselves; those stay with
`check_menus.mjs` and [headless Zen](headless-zen.md). Playwright's Firefox is
a patched build, not Zen, so it says nothing about how Zen draws the page.
Keep it out of CI and out of `tests/`: it needs a downloaded browser.
