/*!
 * Copyright 2020 Cognite AS
 */

import * as reveal from '@cognite/reveal';

async function main() {
  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';
  const cadModel = await reveal.createLocalCadModel(modelUrl);
  document.write(`<p>${JSON.stringify(cadModel.scene.root)}</p>`);
}

main();
