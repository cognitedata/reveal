import { defineConfig, mergeConfig } from 'vite';

import viteMainConfig from '../vite.config';

export default defineConfig(({ command }) => {
  return mergeConfig(viteMainConfig(command, 'digital-cockpit'), {});
});
