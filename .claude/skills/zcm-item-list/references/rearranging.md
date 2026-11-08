# Rearranging: quick actions and "More options"

After hiding, `rearrange()` moves items of a managed menu (the root, not
its submenus): the tab menu's quick actions into `#calmer-tab-actions`, and
items whose keys are in `uc.hidecontext.folded` (a JSON array, like
`uc.hidecontext.items`) into `#calmer-more-options` at the end (inline
`order: 9`, after the reorder option's groups). Each move is recorded with
the item's parent and next sibling and undone in reverse on `popuphidden`,
and the added elements removed, so Firefox, Zen and other mods find the menu
as they built it. Rules:

- Everything the script adds has an id starting with `calmer-`
  (`ownElement`); skip those when recording or keying, and don't manage the
  "More options" popup itself.
- `record()` uses the order saved before rearranging (`layouts`), so
  snapshots and `prev` stay Firefox's, without the script's elements.
- The quick actions' labels are hidden, so they get a shared `<tooltip>`
  that reads the hovered item's label (filled in by Fluent after
  `popupshowing`); only tooltips the script set are removed.
- Shift held while right-clicking shows the whole menu: the window's
  `contextmenu` event says so for menus Zen's own interface opens. The
  page menu is opened from the content process with a synthesized event,
  so Shift can't be seen there; don't claim it is.
