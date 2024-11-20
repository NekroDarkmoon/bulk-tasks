import { sveltePreprocess } from 'svelte-preprocess';

const config = {
  compilerOptions: {
    runes: true
  },
  preprocess: sveltePreprocess({
    typescript: {
      tsconfigFile: './tsconfig.json'
    }
  })
};

export default config;
