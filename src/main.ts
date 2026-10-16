import { Menu, Notice, Plugin, setIcon } from 'obsidian';
import { CONFIG_KEY, MODE_IDS, MODES, isMode } from './modes';
import type { PropertiesMode } from './modes';
import { PropertiesModeToggleSettingTab, normalizeSettings } from './settings';
import type { PropertiesModeToggleSettings } from './settings';

export default class PropertiesModeTogglePlugin extends Plugin {
	settings!: PropertiesModeToggleSettings;
	private ribbonEl!: HTMLElement;
	private statusBarEl!: HTMLElement;

	async onload(): Promise<void> {
		this.settings = normalizeSettings(await this.loadData());

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
		for (const mode of MODE_IDS) {
			this.addCommand({
				id: `set-${mode}`,
				name: `Set properties in document to ${MODES[mode].label}`,
				callback: () => this.setMode(mode),
			});
		}

		// Keeps the ribbon and status bar in sync when the setting changes in Settings or via sync.
		this.registerEvent(
			this.app.vault.on('config-changed', (key) => {
				if (key === CONFIG_KEY) this.refresh();
			}),
		);

		this.addSettingTab(new PropertiesModeToggleSettingTab(this.app, this));
		this.refresh();
	}

	async updateSettings(change: Partial<PropertiesModeToggleSettings>): Promise<void> {
		this.settings = { ...this.settings, ...change };
		await this.saveData(this.settings);
		this.refresh();
	}

	getMode(): PropertiesMode {
		const mode = this.app.vault.getConfig(CONFIG_KEY);
		return isMode(mode) ? mode : 'visible';
	}

	setMode(mode: PropertiesMode): void {
		if (mode === this.getMode()) return;
		this.app.vault.setConfig(CONFIG_KEY, mode);
		if (this.settings.showNotice) new Notice(`Properties in document: ${MODES[mode].label}`);
	}

	cycle(): void {
		const { cycle } = this.settings;
		// A mode left out of the cycle has index -1, so this lands on the first entry.
		const next = cycle[(cycle.indexOf(this.getMode()) + 1) % cycle.length];
		if (next) this.setMode(next);
	}

	private showModeMenu(evt: MouseEvent): void {
		evt.preventDefault();
		const current = this.getMode();
		const menu = new Menu();
		for (const mode of MODE_IDS) {
			const { label, icon } = MODES[mode];
			menu.addItem((item) =>
				item
					.setTitle(label)
					.setIcon(icon)
					.setChecked(mode === current)
					.onClick(() => this.setMode(mode)),
			);
		}
		menu.showAtMouseEvent(evt);
	}

	private refresh(): void {
		const { label, icon } = MODES[this.getMode()];
		const tooltip = `Properties in document: ${label}\nClick to cycle, right-click to choose`;

		setIcon(this.ribbonEl, icon);
		this.ribbonEl.setAttribute('aria-label', tooltip);

		this.statusBarEl.setText(`Properties: ${label}`);
		this.statusBarEl.setAttribute('aria-label', tooltip);
		this.statusBarEl.toggle(this.settings.showStatusBar);
	}
}
