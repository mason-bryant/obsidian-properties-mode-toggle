import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { globalIgnores, defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { PlainTextParser } from 'eslint-plugin-obsidianmd/dist/lib/plainTextParser.js';

export default defineConfig(
	globalIgnores([
		'node_modules',
		'dist',
		'esbuild.config.mjs',
		'version-bump.mjs',
		'versions.json',
		'main.js',
		'package.json',
		'package-lock.json',
		'tsconfig.json',
	]),
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mts', 'manifest.json'],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json'],
			},
		},
	},
	...obsidianmd.configs.recommended,
	// The recommended config's file patterns never match these, so the manifest and license rules wouldn't run.
	{
		files: ['manifest.json'],
		languageOptions: { parser: tseslint.parser },
		plugins: { obsidianmd },
		rules: { 'obsidianmd/validate-manifest': 'error' },
	},
	{
		files: ['LICENSE'],
		languageOptions: { parser: PlainTextParser },
		plugins: { obsidianmd },
		rules: { 'obsidianmd/validate-license': 'error' },
	},
);
