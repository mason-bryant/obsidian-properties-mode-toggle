# Properties Mode Toggle

An Obsidian plugin that switches **Settings → Editor → Properties in document** between **Visible**, **Hidden**, and **Source** without opening Settings.

## Features

- **Commands**
  - *Cycle properties in document*: steps to the next mode in your cycle.
  - *Set properties in document to Visible / Hidden / Source*: jumps straight to a mode.

  Assign hotkeys under **Settings → Hotkeys** (search "Properties Mode Toggle"), or add the commands to the mobile toolbar.
- **Ribbon button**: its icon shows the current mode. Click to cycle; right-click to pick a mode.
- **Status bar item** (desktop): shows `Properties: <mode>`. Click to cycle; right-click to pick a mode.
- **Settings**
  - Choose which modes the cycle includes, for example just Visible ↔ Source.
  - Turn the change notice on or off.
  - Hide the status bar item.

  On Obsidian 1.13 and later, these settings also appear in settings search.

The ribbon button and status bar item stay in sync when the setting changes somewhere else, such as Obsidian's Settings screen or another device syncing `app.json`.

## Notes

- **Vault-wide setting.** "Properties in document" applies to the whole vault, so switching modes changes every open note.
- **Source mode and Reading view.** Source mode only changes the editing view. Reading view still shows the properties box unless the mode is Hidden. That's how Obsidian's own setting works.
- **Undocumented API.** The plugin reads and writes the setting with `app.vault.getConfig` and `app.vault.setConfig`. Obsidian doesn't document these, so a future Obsidian release could change them.

## Installation

### With BRAT

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Run **BRAT: Add a beta plugin for testing**.
3. Enter `mason-bryant/obsidian-properties-mode-toggle`.

### Manually

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/mason-bryant/obsidian-properties-mode-toggle/releases/latest).
2. Copy them into `<vault>/.obsidian/plugins/properties-mode-toggle/`.
3. Reload Obsidian.
4. Enable **Properties Mode Toggle** under **Settings → Community plugins**.

## Development

The source is TypeScript in `src/`, bundled into `main.js` with esbuild. This setup follows Obsidian's [sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin).

```bash
npm install
npm run dev     # rebuild main.js on every change
npm run build   # type-check and build for release
npm run lint    # Obsidian's ESLint rules, the same ones the community directory review uses
```

If the repo lives in `<vault>/.obsidian/plugins/properties-mode-toggle/`, the build writes straight to the installed plugin. Reload it by turning it off and on under **Settings → Community plugins**, or use the [Hot Reload](https://github.com/pjeby/hot-reload) plugin.

### Releasing

1. Run `npm version patch` (or `minor`/`major`). This bumps `manifest.json`, `package.json`, and `versions.json`, commits, and creates a tag without a `v` prefix.
2. Run `git push --follow-tags`.
3. The release workflow builds `main.js`, attests its build provenance, and creates a draft GitHub release with `main.js` and `manifest.json` attached.
4. Publish the draft on GitHub.

`main.js` is build output and isn't committed.

## License

[MIT](LICENSE)
