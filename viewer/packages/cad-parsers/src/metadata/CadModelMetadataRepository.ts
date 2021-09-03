/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMetadataParser } from './CadMetadataParser';
import { SectorScene, WellKnownDistanceToMeterConversionFactors, File3dFormat } from './types';
import { CadModelMetadata } from './CadModelMetadata';
import { MetadataRepository } from './MetadataRepository';
import { transformCameraConfiguration } from './transformCameraConfiguration';
import { ModelDataClient } from './types';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };

export class CadModelMetadataRepository<TModelIdentifier>
  implements MetadataRepository<TModelIdentifier, Promise<CadModelMetadata>>
{
  private readonly _modelMetadataProvider: ModelDataClient<ModelIdentifierWithFormat<TModelIdentifier>>;
  private readonly _cadSceneParser: CadMetadataParser;
  private readonly _blobFileName: string;
  private _currentModelIdentifier = 0;

  constructor(
    modelMetadataProvider: ModelDataClient<TModelIdentifier>,
    cadMetadataParser: CadMetadataParser,
    blobFileName: string = 'scene.json'
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadSceneParser = cadMetadataParser;
    this._blobFileName = blobFileName;
  }

  async loadData(model: TModelIdentifier): Promise<CadModelMetadata> {
    const identifierWithFormat = { format: File3dFormat.RevealCadModel, ...model };
    const blobBaseUrlPromise = this._modelMetadataProvider.getModelUrl(identifierWithFormat);
    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(identifierWithFormat);
    const modelCameraPromise = this._modelMetadataProvider.getModelCamera(identifierWithFormat);

    const blobBaseUrl = await blobBaseUrlPromise;
    const json = await this._modelMetadataProvider.getJsonFile(blobBaseUrl, this._blobFileName);
    const modelIdentifier = `${this._currentModelIdentifier++}`;
    const scene: SectorScene = this._cadSceneParser.parse(json);
    const modelMatrix = createScaleToMetersModelMatrix(scene.unit, await modelMatrixPromise);
    const inverseModelMatrix = new THREE.Matrix4().copy(modelMatrix).invert();
    const cameraConfiguration = await modelCameraPromise;

    return {
      modelIdentifier,
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
