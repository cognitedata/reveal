/*!
 * Copyright 2020 Cognite AS
 */

import { getParamsFromURL } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { SimpleRevealManager, CadNode } from '@cognite/reveal/threejs';

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'ivar-aasen' });
  const client = new CogniteClient({ appId: 'reveal.example.no-rendering' });
  client.loginWithOAuth({ project });

  console.log(project, modelUrl, modelRevision);
  const revealManager = new SimpleRevealManager(client, () => {});
  let model: CadNode;
  if (modelUrl) {
    model = await revealManager.addModelFromUrl(modelUrl);
  } else if (modelRevision) {
    model = await revealManager.addModelFromCdf(modelRevision);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  document.write(`<p>${JSON.stringify(model.cadModel.scene.root)}</p>`);
}

main();
