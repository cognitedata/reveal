/*!
 * Copyright 2020 Cognite AS
 */

import { getParamsFromURL, createRenderManager } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import * as reveal from '@cognite/reveal/experimental';

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.no-rendering' });
  client.loginWithOAuth({ project });

  // tslint:disable-next-line: no-console
  console.log(project, modelUrl, modelRevision);
  const revealManager: reveal.RenderManager = createRenderManager(
    modelRevision !== undefined ? 'cdf' : 'local',
    client
  );

  let model: reveal.CadNode;
  if (revealManager instanceof reveal.LocalHostRevealManager && modelUrl !== undefined) {
    model = await revealManager.addModel('cad', modelUrl);
  } else if (revealManager instanceof reveal.RevealManager && modelRevision !== undefined) {
    model = await revealManager.addModel('cad', modelRevision);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  document.write(`<p>${JSON.stringify(model.cadModelMetadata.scene.root)}</p>`);
}

main();
