/*!
 * Copyright 2021 Cognite AS
 */
import { CadNode } from './CadNode';
import { MaterialManager } from './MaterialManager';

import { CadModelMetadata } from '.';

export class CadModelFactory {
  private readonly _materialManager: MaterialManager;
  constructor(materialManager: MaterialManager) {
    this._materialManager = materialManager;
  }

  createModel(modelMetadata: CadModelMetadata): CadNode {
    const { blobUrl, scene } = modelMetadata;
    const cadModel = new CadNode(modelMetadata, this._materialManager);
    this._materialManager.addModelMaterials(blobUrl, scene.maxTreeIndex);
    return cadModel;
  }
}
