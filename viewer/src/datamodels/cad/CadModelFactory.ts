/*!
 * Copyright 2020 Cognite AS
 */
import { CadNode } from './CadNode';
import { MaterialManager } from './MaterialManager';
import { ModelNodeAppearance } from './ModelNodeAppearance';
import { CadModelMetadata } from './CadModelMetadata';
import { ModelRenderAppearance } from './ModelRenderAppearance';

export class CadModelFactory {
  private readonly _materialManager: MaterialManager;
  constructor(materialManager: MaterialManager) {
    this._materialManager = materialManager;
  }

  createModel(
    modelMetadata: CadModelMetadata,
    modelNodeAppearance?: ModelNodeAppearance,
    modelRenderAppearance?: ModelRenderAppearance
  ): CadNode {
    const { blobUrl, scene } = modelMetadata;
    const cadModel = new CadNode(modelMetadata, this._materialManager);
    this._materialManager.addModelMaterials(blobUrl, scene.maxTreeIndex);

    if (modelNodeAppearance) {
      this._materialManager.setNodeAppearance(blobUrl, modelNodeAppearance);
    }
    if (modelRenderAppearance) {
      this._materialManager.setRenderAppearance(blobUrl, modelRenderAppearance);
    }

    this._materialManager.updateModelNodes(blobUrl, [...Array(scene.maxTreeIndex + 1).keys()]);

    return cadModel;
  }
}
