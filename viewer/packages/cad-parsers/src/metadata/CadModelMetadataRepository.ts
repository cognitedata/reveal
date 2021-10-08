/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMetadataParser } from './CadMetadataParser';
import { SectorScene, WellKnownDistanceToMeterConversionFactors } from '../utilities/types';
import { CadModelMetadata } from './CadModelMetadata';
import { MetadataRepository } from './MetadataRepository';
import { transformCameraConfiguration } from '@reveal/utilities';

import { ModelDataProvider, ModelMetadataProvider, ModelIdentifier } from '@reveal/modeldata-api';

export class CadModelMetadataRepository implements MetadataRepository<Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider;
  private readonly _modelDataProvider: ModelDataProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  private readonly _blobFileName: string;
  private _currentModelIdentifier = 0;

  constructor(
    modelMetadataProvider: ModelMetadataProvider,
    modelDataProvider: ModelDataProvider,
    cadMetadataParser: CadMetadataParser,
    blobFileName: string = 'scene.json'
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._modelDataProvider = modelDataProvider;
    this._cadSceneParser = cadMetadataParser;
    this._blobFileName = blobFileName;
  }

  async loadData(modelIdentifier: ModelIdentifier): Promise<CadModelMetadata> {
    const blobBaseUrlPromise = this._modelMetadataProvider.getModelUrl(modelIdentifier);
    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(modelIdentifier);
    const modelCameraPromise = this._modelMetadataProvider.getModelCamera(modelIdentifier);

    const blobBaseUrl = await blobBaseUrlPromise;
    const json = await this._modelDataProvider.getJsonFile(blobBaseUrl, this._blobFileName);
    const scene: SectorScene = this._cadSceneParser.parse(json);
    const modelMatrix = createScaleToMetersModelMatrix(scene.unit, await modelMatrixPromise);
    const inverseModelMatrix = new THREE.Matrix4().copy(modelMatrix).invert();
    const cameraConfiguration = await modelCameraPromise;

    return {
      modelIdentifier: `${this._currentModelIdentifier++}`, // TODO 2021-10-03 larsmoa: Change to ModelIdentifier
      modelBaseUrl: blobBaseUrl,
      // Clip box is not loaded, it must be set elsewhere
      geometryClipBox: null,
      modelMatrix,
      inverseModelMatrix,
      cameraConfiguration: transformCameraConfiguration(cameraConfiguration, modelMatrix),
      scene
    };
  }
}

function createScaleToMetersModelMatrix(unit: string, modelMatrix: THREE.Matrix4): THREE.Matrix4 {
  const conversionFactor = WellKnownDistanceToMeterConversionFactors.get(unit);
  if (conversionFactor === undefined) {
    throw new Error(`Unknown model unit '${unit}'`);
  }

  const scaledModelMatrix = new THREE.Matrix4().makeScale(conversionFactor, conversionFactor, conversionFactor);
  return scaledModelMatrix.multiply(modelMatrix);
}
