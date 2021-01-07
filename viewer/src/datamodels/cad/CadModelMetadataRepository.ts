/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMetadataParser } from './parsers/CadMetadataParser';
import { SectorScene, WellKnownDistanceToMeterConversionFactors } from './sector/types';
import { File3dFormat } from '../../utilities';
import { CadModelMetadata } from './CadModelMetadata';
import { MetadataRepository } from '../base';
import { transformCameraConfiguration } from '../../utilities/transformCameraConfiguration';
import { ModelDataClient } from '../../utilities/networking/types';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };

export class CadModelMetadataRepository<TModelIdentifier>
  implements MetadataRepository<TModelIdentifier, Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelDataClient<ModelIdentifierWithFormat<TModelIdentifier>>;
  private readonly _cadSceneParser: CadMetadataParser;
  private readonly _blobFileName: string;

  constructor(
    modelMetadataProvider: ModelDataClient<TModelIdentifier>,
    cadMetadataParser: CadMetadataParser,
    blobFileName: string = 'scene.json'
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadSceneParser = cadMetadataParser;
    this._blobFileName = blobFileName;
  }

  async loadData(modelIdentifier: TModelIdentifier): Promise<CadModelMetadata> {
    const identifierWithFormat = { format: File3dFormat.RevealCadModel, ...modelIdentifier };
    const blobUrlPromise = this._modelMetadataProvider.getModelUrl(identifierWithFormat);
    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(identifierWithFormat);
    const modelCameraPromise = this._modelMetadataProvider.getModelCamera(identifierWithFormat);

    const blobUrl = await blobUrlPromise;
    const json = await this._modelMetadataProvider.getJsonFile(blobUrl, this._blobFileName);
    const scene: SectorScene = this._cadSceneParser.parse(json);
    const modelMatrix = createScaleToMetersModelMatrix(scene.unit, await modelMatrixPromise);
    const inverseModelMatrix = new THREE.Matrix4().copy(modelMatrix).invert();
    const cameraConfiguration = await modelCameraPromise;

    return {
      blobUrl,
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
