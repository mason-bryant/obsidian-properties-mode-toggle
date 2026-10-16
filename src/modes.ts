import type { IconName } from 'obsidian';

// Settings → Editor → "Properties in document", stored in .obsidian/app.json.
export const CONFIG_KEY = 'propertiesInDocument';

export type PropertiesMode = 'visible' | 'hidden' | 'source';

export const MODE_IDS: readonly PropertiesMode[] = ['visible', 'hidden', 'source'];

export const MODES: Record<PropertiesMode, { label: string; icon: IconName }> = {
	visible: { label: 'Visible', icon: 'eye' },
	hidden: { label: 'Hidden', icon: 'eye-off' },
	source: { label: 'Source', icon: 'code' },
};

export function isMode(value: unknown): value is PropertiesMode {
	return typeof value === 'string' && (MODE_IDS as readonly string[]).includes(value);
}
