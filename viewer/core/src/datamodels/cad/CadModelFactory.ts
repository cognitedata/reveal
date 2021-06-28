/*!
 * Copyright 2021 Cognite AS
 */
import { CadNode } from './CadNode';

import { CadMaterialManager } from './CadMaterialManager';
import { CadModelMetadata } from './CadModelMetadata';

export class CadModelFactory {
  private readonly _materialManager: CadMaterialManager;
  constructor(materialManager: CadMaterialManager) {
    this._materialManager = materialManager;
  }

  createModel(modelMetadata: CadModelMetadata): CadNode {
    const { blobUrl, scene } = modelMetadata;
    const cadModel = new CadNode(modelMetadata, this._materialManager);
    this._materialManager.addModelMaterials(blobUrl, scene.maxTreeIndex);
    return cadModel;
  }
}
