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

1. Copy `main.js` and `manifest.json` into `<vault>/.obsidian/plugins/properties-mode-toggle/`.
2. Reload Obsidian.
3. Enable **Properties Mode Toggle** under **Settings → Community plugins**.

## Development

The plugin is plain CommonJS JavaScript, so there's no build step. Edit `main.js`, then reload the plugin in Obsidian:

1. Turn it off and on under **Settings → Community plugins**, or
2. Use the [Hot Reload](https://github.com/pjeby/hot-reload) plugin.

When you release, bump `version` in `manifest.json` and add a matching entry to `versions.json`.

## License

[MIT](LICENSE)
