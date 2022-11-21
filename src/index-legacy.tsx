/* eslint-disable no-console */

/**
 * This is an entry file for the Legacy Charts.
 * It needs to be separate from the Charts in Fusion entry file because the render strategy differs a bit -
 * Legacy Charts must be rendered directly in React DOM, while Charts in Fusion emit a single index.js file
 * to be used by Single SPA.
 *
 * This file is used in config-overrides.js file in legacyConfig as an entry point
 * for the app. If you want to change its name or move to another directory you need
 * to change the config.entry in the config-overrides as well.
 */

import ReactDOM from 'react-dom';

import config from 'config/config';
import { isDevelopment, isPR } from './utils/environment';

import { RootAppLegacy } from './AppLegacy';

console.log(`[Legacy Charts] Cognite Charts running in ${config.environment}`);

if (isDevelopment || isPR) {
  console.log('Config', config);
}

ReactDOM.render(<RootAppLegacy />, document.getElementById('root'));
