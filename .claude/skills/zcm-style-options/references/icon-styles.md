# Icon styles

`uc.fixcontext.iconpack` (a string: `zen`, `fluent`, `zenui`; a choice on the
settings page) picks the icons of "Icons for every option" and the quick
actions. Zen's are `chrome.css`'s. Fluent and ZenUI come from Context Menu
Icons by Starry-AXQG (MIT; keep `context-menu/icons/LICENSE` and the README
credit):

- `context-menu/icons/packs.json` maps each Zen icon `chrome.css` uses to
  the pack's file, plus per-item overrides (`items`, keyed by the selector
  as written in `chrome.css`, on one line). `<pack>/` holds only the SVGs
  it uses, each drawn with `context-fill`.
- `node scripts/build_icon_packs.mjs` writes `<pack>.css`: every icon rule
  of the restoreicons block under `:root` (so it beats `chrome.css`) inside
  `@media -moz-pref("uc.fixcontext.iconpack", "<pack>")`, with Zen's icon
  where the pack has none. Run it after changing either file;
  `tests/icon_packs.test.mjs` fails until you do. Prettier skips them.
- The script loads them as `data:` user sheets with **absolute** icon
  URLs: an `url()` inside a custom property is resolved against the sheet
  that uses the variable (`chrome.css`), and an SVG only gets
  `context-fill` from a `chrome://` or `resource://` address.
- An item whose own pack icon replaces a mirrored Zen one (Redo uses Undo's)
  gets `transform: none`.
