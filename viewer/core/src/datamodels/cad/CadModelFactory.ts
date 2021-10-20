/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { CadMaterialManager, CadNode } from '@reveal/rendering';
import { CadModelMetadata, CadModelMetadataRepository } from '@reveal/cad-parsers';
import { BoundingBoxClipper } from '../../utilities/BoundingBoxClipper';
import { GeometryFilter } from '../..';
import { CadModelClipper } from './sector/CadModelClipper';
import { ModelDataClient, ModelMetadataProvider } from '@reveal/modeldata-api';

export class CadModelFactory<TModelIdentifier> {
  private readonly _materialManager: CadMaterialManager;
  private _cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>;
  constructor(
    materialManager: CadMaterialManager,
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    modelDataClient: ModelDataClient
  ) {
    this._materialManager = materialManager;
    this._cadModelMetadataRepository = new CadModelMetadataRepository<TModelIdentifier>(
      modelMetadataProvider,
      modelDataClient
    );
  }

  async createModel(externalModelIdentifier: TModelIdentifier, geometryFilter?: GeometryFilter): Promise<CadNode> {
    const metadata = await this._cadModelMetadataRepository.loadData(externalModelIdentifier);
    // if (this._cadModelMap.has(metadata.modelIdentifier)) {
    //   throw new Error(`Model ${modelIdentifier} has already been added`);
    // }
    // Apply clipping box
    const geometryClipBox = determineGeometryClipBox(geometryFilter, metadata);
    const modelMetadata = createClippedModel(metadata, geometryClipBox);

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

function determineGeometryClipBox(
  geometryFilter: GeometryFilter | undefined,
  cadModel: CadModelMetadata
): THREE.Box3 | null {
  if (geometryFilter === undefined || geometryFilter.boundingBox === undefined) {
    return null;
  }
  if (!geometryFilter.isBoundingBoxInModelCoordinates) {
    return geometryFilter.boundingBox;
  }

  const bbox = geometryFilter.boundingBox.clone();
  bbox.applyMatrix4(cadModel.inverseModelMatrix);
  return bbox;
}

function createClippedModel(cadModel: CadModelMetadata, geometryClipBox: THREE.Box3 | null): CadModelMetadata {
  if (geometryClipBox === null) {
    return cadModel;
  }

  const clipper = new CadModelClipper(geometryClipBox);
  return clipper.createClippedModel(cadModel);
}
