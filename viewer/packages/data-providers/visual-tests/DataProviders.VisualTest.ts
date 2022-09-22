/*!
 * Copyright 2022 Cognite AS
 */

import { SimpleTestFixtureComponents, SimpleVisualTestFixture } from '../../../visual-tests';
import { File3dFormat } from '../src/types';

export default class DataProvidersVisualTestFixture extends SimpleVisualTestFixture {
  public async setup(simpleTestFixtureComponents: SimpleTestFixtureComponents): Promise<void> {
    const { dataProviders, renderer } = simpleTestFixtureComponents;

    const { modelDataProvider, modelIdentifier, modelMetadataProvider } = dataProviders;

    const outputs = await modelMetadataProvider.getModelOutputs(modelIdentifier);

    const domElement = renderer.domElement;

    const p = document.createElement('pre');
    p.style.color = 'white';
    p.style.position = 'absolute';
    p.style.top = '50px';
    p.style.left = '50px';
    p.style.fontSize = '13px';

    domElement.parentElement!.appendChild(p);

    const out = await Promise.all(
      outputs.map(async output => {
        const modelUri = await modelMetadataProvider.getModelUri(modelIdentifier, output);
        const cameraState = await modelMetadataProvider.getModelCamera(modelIdentifier);
        const modelMatrix = await modelMetadataProvider.getModelMatrix(modelIdentifier, output.format);
        const sceneJson = await modelDataProvider.getJsonFile(modelUri, this.getSceneName(output.format));

        return {
          ...output,
          modelUri,
          cameraState,
          modelMatrix,
          sceneJson
        };
      })
    );

    p.innerText = `${modelIdentifier}: [${out.map(output => JSON.stringify(output, null, 4)).join(',\n')}]`;
  }

  private getSceneName(format: File3dFormat | string) {
    switch (format) {
      case File3dFormat.GltfCadModel:
        return 'scene.json';
      case File3dFormat.EptPointCloud:
        return 'ept.json';
      default:
        throw new Error('asd');
    }
  }
}
