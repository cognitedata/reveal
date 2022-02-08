/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { BoundingBoxClipper } from '../../utilities/BoundingBoxClipper';
import { GeometryFilter, SupportedModelTypes } from '../..';
import { CadModelClipper } from './sector/CadModelClipper';

import { GltfSectorRepository, SectorRepository, V8SectorRepository } from '@reveal/sector-loader';
import { CadMaterialManager, CadNode } from '@reveal/rendering';
import { CadModelMetadata, CadModelMetadataRepository } from '@reveal/cad-parsers';
import { ModelDataProvider, ModelMetadataProvider, ModelIdentifier, File3dFormat } from '@reveal/modeldata-api';
import { MetricsLogger } from '@reveal/metrics';

export class CadModelFactory {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadModelMetadataRepository: CadModelMetadataRepository;
  private readonly _v8SectorRepository: V8SectorRepository;
  private readonly _gltfSectorRepository: GltfSectorRepository;

  constructor(
    materialManager: CadMaterialManager,
    modelMetadataProvider: ModelMetadataProvider,
    modelDataProvider: ModelDataProvider
  ) {
    this._materialManager = materialManager;
    this._cadModelMetadataRepository = new CadModelMetadataRepository(modelMetadataProvider, modelDataProvider);
    this._v8SectorRepository = new V8SectorRepository(modelDataProvider, materialManager);
    this._gltfSectorRepository = new GltfSectorRepository(modelDataProvider, materialManager);
  }

  async createModel(externalModelIdentifier: ModelIdentifier, geometryFilter?: GeometryFilter): Promise<CadNode> {
    const metadata = await this._cadModelMetadataRepository.loadData(externalModelIdentifier);
    console.log(metadata);

    const geometryClipBox = determineGeometryClipBox(geometryFilter, metadata);
    const modelMetadata = createClippedModel(metadata, geometryClipBox);

    const { modelIdentifier, scene, format, formatVersion } = modelMetadata;
    const modelType: SupportedModelTypes = 'cad';
    MetricsLogger.trackLoadModel(
      {
        type: modelType
      },
      modelIdentifier,
      formatVersion
    );
    const sectorRepository = this.getSectorRepository(format, formatVersion);

    this._materialManager.addModelMaterials(modelIdentifier, scene.maxTreeIndex);
    const cadModel = new CadNode(modelMetadata, this._materialManager, sectorRepository);

    if (modelMetadata.geometryClipBox !== null) {
      const clipBox = transformToThreeJsSpace(modelMetadata.geometryClipBox, modelMetadata);
      const clippingPlanes = new BoundingBoxClipper(clipBox).clippingPlanes;
      this._materialManager.setModelClippingPlanes(modelMetadata.modelIdentifier, clippingPlanes);
    }

    return cadModel;
  }

  private getSectorRepository(format: File3dFormat, formatVersion: number): SectorRepository {
    if (format === File3dFormat.RevealCadModel && formatVersion === 8) {
      return this._v8SectorRepository;
    } else if (format === File3dFormat.GltfCadModel && formatVersion === 9) {
      return this._gltfSectorRepository;
    } else {
      throw new Error(
        `Model format [${format} v${formatVersion}] is not supported (only version 8 and 9 is supported)`
      );
    }
  }

  dispose(): void {
    this._v8SectorRepository.clear();
    this._gltfSectorRepository.clear();
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
