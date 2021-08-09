/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { CadNode } from './CadNode';

import { CadMaterialManager } from './CadMaterialManager';
import { CadModelMetadata } from './CadModelMetadata';
import { BoundingBoxClipper } from '../../utilities/BoundingBoxClipper';

export class CadModelFactory {
  private readonly _materialManager: CadMaterialManager;
  constructor(materialManager: CadMaterialManager) {
    this._materialManager = materialManager;
  }

  createModel(modelMetadata: CadModelMetadata): CadNode {
    const { modelIdentifier, scene } = modelMetadata;
    const cadModel = new CadNode(modelMetadata, this._materialManager);
    this._materialManager.addModelMaterials(modelIdentifier, scene.maxTreeIndex);
    if (modelMetadata.geometryClipBox !== null) {
      const clipBox = transformToThreeJsSpace(modelMetadata.geometryClipBox, modelMetadata);
      const clippingPlanes = new BoundingBoxClipper(clipBox).clippingPlanes;
      this._materialManager.setModelClippingPlanes(modelMetadata.modelIdentifier, clippingPlanes);
    }

    return cadModel;
  }
}

function transformToThreeJsSpace(geometryClipBox: THREE.Box3, modelMetadata: CadModelMetadata): THREE.Box3 {
  const min = geometryClipBox.min.clone().applyMatrix4(modelMetadata.modelMatrix);
  const max = geometryClipBox.max.clone().applyMatrix4(modelMetadata.modelMatrix);
  return new THREE.Box3().setFromPoints([min, max]);
}
