'use strict';

const { Plugin, PluginSettingTab, Setting, Notice, Menu, setIcon } = require('obsidian');

// Settings → Editor → "Properties in document". getConfig/setConfig are private API; setConfig
// saves app.json and fires "config-changed", which open views re-render on.
const CONFIG_KEY = 'propertiesInDocument';

const MODES = {
  visible: { label: 'Visible', icon: 'eye' },
  hidden: { label: 'Hidden', icon: 'eye-off' },
  source: { label: 'Source', icon: 'code' },
};

const DEFAULT_SETTINGS = {
  cycle: ['visible', 'hidden', 'source'],
  showNotice: true,
  showStatusBar: true,
};

module.exports = class PropertiesModeTogglePlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    this.ribbonEl = this.addRibbonIcon(MODES.visible.icon, 'Properties in document', () => this.cycle());
    this.registerDomEvent(this.ribbonEl, 'contextmenu', (evt) => this.showModeMenu(evt));

    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass('mod-clickable');
    this.statusBarEl.setAttribute('data-tooltip-position', 'top');
    this.registerDomEvent(this.statusBarEl, 'click', () => this.cycle());
    this.registerDomEvent(this.statusBarEl, 'contextmenu', (evt) => this.showModeMenu(evt));

    this.addCommand({
      id: 'cycle',
      name: 'Cycle properties in document',
      callback: () => this.cycle(),
    });
    for (const [mode, { label }] of Object.entries(MODES)) {
      this.addCommand({
        id: `set-${mode}`,
        name: `Set properties in document to ${label}`,
        callback: () => this.setMode(mode),
      });
    }

    // Keep the ribbon and status bar in sync when the setting is changed from Settings
    // or by another device syncing app.json.
    this.registerEvent(this.app.vault.on('config-changed', (key) => {
      if (key === CONFIG_KEY) this.refresh();
    }));

    this.addSettingTab(new PropertiesModeToggleSettingTab(this.app, this));
    this.refresh();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    // Keep the cycle in a fixed order and drop anything unknown.
    const cycle = Object.keys(MODES).filter((mode) => (this.settings.cycle || []).includes(mode));
    this.settings.cycle = cycle.length >= 2 ? cycle : [...DEFAULT_SETTINGS.cycle];
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  getMode() {
    const mode = this.app.vault.getConfig(CONFIG_KEY);
    return MODES[mode] ? mode : 'visible';
  }

  setMode(mode) {
    if (mode === this.getMode()) return;
    this.app.vault.setConfig(CONFIG_KEY, mode);
    if (this.settings.showNotice) new Notice(`Properties in document: ${MODES[mode].label}`);
  }

  cycle() {
    const { cycle } = this.settings;
    // If the current mode was left out of the cycle, indexOf is -1 and this lands on the first entry.
    const next = cycle[(cycle.indexOf(this.getMode()) + 1) % cycle.length];
    this.setMode(next);
  }

  showModeMenu(evt) {
    evt.preventDefault();
    const current = this.getMode();
    const menu = new Menu();
    for (const [mode, { label, icon }] of Object.entries(MODES)) {
      menu.addItem((item) => item
        .setTitle(label)
        .setIcon(icon)
        .setChecked(mode === current)
        .onClick(() => this.setMode(mode)));
    }
    menu.showAtMouseEvent(evt);
  }

  refresh() {
    const { label, icon } = MODES[this.getMode()];
    const tooltip = `Properties in document: ${label}\nClick to cycle, right-click to choose`;

    setIcon(this.ribbonEl, icon);
    this.ribbonEl.setAttribute('aria-label', tooltip);

    this.statusBarEl.setText(`Properties: ${label}`);
    this.statusBarEl.setAttribute('aria-label', tooltip);
    this.statusBarEl.toggle(this.settings.showStatusBar);
  }
};

class PropertiesModeToggleSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const { settings } = this.plugin;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Modes to cycle through')
      .setDesc('The cycle command, ribbon button, and status bar item step through these in order. Assign hotkeys under Settings → Hotkeys by searching "Properties Mode Toggle".')
      .setHeading();

    for (const [mode, { label }] of Object.entries(MODES)) {
      new Setting(containerEl)
        .setName(label)
        .addToggle((toggle) => toggle
          .setValue(settings.cycle.includes(mode))
          .onChange(async (include) => {
            const cycle = Object.keys(MODES).filter((m) => (m === mode ? include : settings.cycle.includes(m)));
            if (cycle.length < 2) {
              new Notice('Keep at least two modes in the cycle.');
              this.display();
              return;
            }
            settings.cycle = cycle;
            await this.plugin.saveSettings();
          }));
    }

    new Setting(containerEl).setName('Display').setHeading();

    new Setting(containerEl)
      .setName('Show a notice when the mode changes')
      .addToggle((toggle) => toggle
        .setValue(settings.showNotice)
        .onChange(async (value) => {
          settings.showNotice = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show the current mode in the status bar')
      .setDesc('Desktop only. Click it to cycle, right-click to pick a mode.')
      .addToggle((toggle) => toggle
        .setValue(settings.showStatusBar)
        .onChange(async (value) => {
          settings.showStatusBar = value;
          await this.plugin.saveSettings();
          this.plugin.refresh();
        }));
  }
}
