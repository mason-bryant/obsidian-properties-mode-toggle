import type { EventRef } from 'obsidian';

// Undocumented Vault API for app.json settings. setConfig saves the file and fires
// "config-changed", which open views re-render on.
declare module 'obsidian' {
	interface Vault {
		getConfig(key: string): unknown;
		setConfig(key: string, value: unknown): void;
		on(name: 'config-changed', callback: (key: string) => unknown, ctx?: unknown): EventRef;
	}
}
