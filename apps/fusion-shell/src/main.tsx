import { isUsingUnifiedSignin } from '@cognite/cdf-utilities';
import { setRemoteDefinitions } from '@fusion/load-remote-module';
import('./bootstrap');

const basePath = isUsingUnifiedSignin() ? `/cdf/` : '/';

// Load module federation manifest for sub-apps we want to use
fetch(basePath + 'sub-apps-modules-config.json')
  .then((res) => res.json())
  .then((definitions) => setRemoteDefinitions(definitions))
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
