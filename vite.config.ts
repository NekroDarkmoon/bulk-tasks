import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import path from 'node:path';

const config = {
	root: 'src/',
	base: '/modules/bulk-tasks/',
	publicDir: false,
	server: {
		port: 30001,
		open: '/game',
		proxy: {
			'^(/modules/bulk-tasks/(assets|lang|style.css))': 'http://localhost:30000',
			'^(?!/modules/bulk-tasks)': 'http://localhost:30000',
			'/socket.io': {
				target: 'ws://localhost:30000',
				ws: true,
			},
		},
	},
	build: {
		outDir: __dirname,
		emptyOutDir: false,
		sourcemap: true,
		brotliSize: true,
		lib: {
			name: 'Bulk Tasks',
			entry: path.resolve(__dirname, 'src/bulkTasks.ts'),
			formats: ['es'],
			fileName: 'bulkTasks',
		},
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) => {
					if (assetInfo.name === 'style.css') return 'bulk-tasks.css';
					return assetInfo.name;
				},
			},
		},
	},
	esbuild: {
		keepNames: true,
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({
				typescript: {
					tsconfigFile: './tsconfig.json',
				},
			}),
			onwarn: (warning, handler) => {
				// Suppress `a11y-missing-attribute` for missing href in <a> links.
				// Foundry doesn't follow accessibility rules.
				if (warning.message.includes('<a> element should have an href attribute')) return;
				if (warning.code === 'a11y-click-events-have-key-events') return;

				// eslint-disable-next-line no-console
				console.log(warning);

				// Let Rollup handle all other warnings normally.
				handler?.(warning);
			},
		}),
	],
};

export default config;
