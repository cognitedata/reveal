import { isUsingUnifiedSignin } from '@cognite/cdf-utilities';
import { setRemoteDefinitions } from '@fusion/load-remote-module';
import { buildModuleFederationImportMap } from './app/utils/sub-apps-utils';
import { AppManifest } from './app/types';

// The same build output is using for both unified signin and legacy fusion app
const basePath = isUsingUnifiedSignin() ? `/cdf/` : '/';

// Load module federation manifest for sub-apps we want to use
fetch(basePath + 'apps-manifest.json')
  .then((res) => res.json())
  .then((appManifestJson) =>
    buildModuleFederationImportMap(appManifestJson as AppManifest)
  )
  .then((definitions) => setRemoteDefinitions(definitions))
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
