import { PluginSettingTab, Setting, requireApiVersion } from 'obsidian';
import type { App, SettingDefinition, SettingDefinitionItem, ToggleComponent } from 'obsidian';
import type PropertiesModeTogglePlugin from './main';
import { MODE_IDS, MODES, isMode } from './modes';
import type { PropertiesMode } from './modes';

export interface PropertiesModeToggleSettings {
	cycle: PropertiesMode[];
	showNotice: boolean;
	showStatusBar: boolean;
}

export const DEFAULT_SETTINGS: PropertiesModeToggleSettings = {
	cycle: [...MODE_IDS],
	showNotice: true,
	showStatusBar: true,
};

// Saved data can be hand-edited or come from an older version, so keep only known values.
export function normalizeSettings(data: unknown): PropertiesModeToggleSettings {
	const saved = (typeof data === 'object' && data !== null ? data : {}) as Partial<
		Record<keyof PropertiesModeToggleSettings, unknown>
	>;
	const savedCycle: unknown[] = Array.isArray(saved.cycle) ? saved.cycle : [];
	const cycle = MODE_IDS.filter((mode) => savedCycle.includes(mode));
	return {
		cycle: cycle.length >= 2 ? cycle : [...DEFAULT_SETTINGS.cycle],
		showNotice: typeof saved.showNotice === 'boolean' ? saved.showNotice : DEFAULT_SETTINGS.showNotice,
		showStatusBar:
			typeof saved.showStatusBar === 'boolean' ? saved.showStatusBar : DEFAULT_SETTINGS.showStatusBar,
	};
}

// Keeps the cycle in a fixed order regardless of toggle order.
function cycleWith(cycle: readonly PropertiesMode[], mode: PropertiesMode, include: boolean): PropertiesMode[] {
	return MODE_IDS.filter((m) => (m === mode ? include : cycle.includes(m)));
}

const CYCLE_KEY_PREFIX = 'cycle.';

function modeFromKey(key: string): PropertiesMode | null {
	if (!key.startsWith(CYCLE_KEY_PREFIX)) return null;
	const mode = key.slice(CYCLE_KEY_PREFIX.length);
	return isMode(mode) ? mode : null;
}

const NOTICE_NAME = 'Show a notice when the mode changes';
const STATUS_BAR_NAME = 'Show the current mode in the status bar';
const STATUS_BAR_DESC = 'Desktop only. Click it to cycle, right-click to pick a mode.';
const CYCLE_HEADING = 'Modes to cycle through';

export class PropertiesModeToggleSettingTab extends PluginSettingTab {
	plugin: PropertiesModeTogglePlugin;

	constructor(app: App, plugin: PropertiesModeTogglePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// Obsidian 1.13+ renders these and includes them in settings search.
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{ name: NOTICE_NAME, control: { type: 'toggle', key: 'showNotice' } },
			{ name: STATUS_BAR_NAME, desc: STATUS_BAR_DESC, control: { type: 'toggle', key: 'showStatusBar' } },
			{
				type: 'group',
				heading: CYCLE_HEADING,
				items: MODE_IDS.map(
					(mode): SettingDefinition => ({
						name: MODES[mode].label,
						control: {
							type: 'toggle',
							key: CYCLE_KEY_PREFIX + mode,
							disabled: () => this.isLocked(mode),
						},
					}),
				),
			},
		];
	}

	getControlValue(key: string): unknown {
		const mode = modeFromKey(key);
		if (mode) return this.plugin.settings.cycle.includes(mode);
		if (key === 'showNotice' || key === 'showStatusBar') return this.plugin.settings[key];
		return undefined;
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		const mode = modeFromKey(key);
		if (mode) {
			const cycle = cycleWith(this.plugin.settings.cycle, mode, value === true);
			if (cycle.length < 2) return;
			await this.plugin.updateSettings({ cycle });
			// Re-evaluates the other toggles' disabled state. Only reachable on 1.13+, guarded for the linter.
			if (requireApiVersion('1.13.0')) this.refreshDomState();
		} else if (key === 'showNotice' && typeof value === 'boolean') {
			await this.plugin.updateSettings({ showNotice: value });
		} else if (key === 'showStatusBar' && typeof value === 'boolean') {
			await this.plugin.updateSettings({ showStatusBar: value });
		}
	}

	// Fallback for Obsidian versions before 1.13, which don't call getSettingDefinitions().
	display(): void {
		const { containerEl } = this;
		const { settings } = this.plugin;
		containerEl.empty();

		new Setting(containerEl).setName(NOTICE_NAME).addToggle((toggle) =>
			toggle.setValue(settings.showNotice).onChange(async (showNotice) => {
				await this.plugin.updateSettings({ showNotice });
			}),
		);

		new Setting(containerEl)
			.setName(STATUS_BAR_NAME)
			.setDesc(STATUS_BAR_DESC)
			.addToggle((toggle) =>
				toggle.setValue(settings.showStatusBar).onChange(async (showStatusBar) => {
					await this.plugin.updateSettings({ showStatusBar });
				}),
			);

		new Setting(containerEl).setName(CYCLE_HEADING).setHeading();

		const toggles = new Map<PropertiesMode, ToggleComponent>();
		const syncLocks = () => {
			for (const [mode, toggle] of toggles) toggle.setDisabled(this.isLocked(mode));
		};
		for (const mode of MODE_IDS) {
			new Setting(containerEl).setName(MODES[mode].label).addToggle((toggle) => {
				toggles.set(mode, toggle);
				toggle.setValue(settings.cycle.includes(mode)).onChange(async (include) => {
					const cycle = cycleWith(this.plugin.settings.cycle, mode, include);
					if (cycle.length >= 2) await this.plugin.updateSettings({ cycle });
					syncLocks();
				});
			});
		}
		syncLocks();
	}

	// A mode can't be turned off when only two are left in the cycle.
	private isLocked(mode: PropertiesMode): boolean {
		const { cycle } = this.plugin.settings;
		return cycle.length <= 2 && cycle.includes(mode);
	}
}
