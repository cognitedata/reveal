import { defineConfig, mergeConfig } from 'vite';

import viteMainConfig from '../vite.config';

export default defineConfig(({ command }) =>
  mergeConfig(viteMainConfig(command, 'simconfig'), {})
);
