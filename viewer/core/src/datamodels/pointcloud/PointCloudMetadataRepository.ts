/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { PointCloudMetadata } from './PointCloudMetadata';
import { MetadataRepository } from '../base';

import { transformCameraConfiguration } from '@reveal/utilities';

import { ModelDataProvider, ModelMetadataProvider, ModelIdentifier } from '@reveal/modeldata-api';

const identityMatrix = new THREE.Matrix4().identity();

export class PointCloudMetadataRepository implements MetadataRepository<Promise<PointCloudMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider;
  private readonly _modelDataProvider: ModelDataProvider;
  private readonly _blobFileName: string;

  constructor(
    modelMetadataProvider: ModelMetadataProvider,
    modelDataProvider: ModelDataProvider,
    blobFileName: string = 'ept.json'
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._modelDataProvider = modelDataProvider;
    this._blobFileName = blobFileName;
  }

  async loadData(modelIdentifier: ModelIdentifier): Promise<PointCloudMetadata> {
    const baseUrlPromise = this._modelMetadataProvider.getModelUrl(modelIdentifier);
    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(modelIdentifier);
    const cameraConfigurationPromise = this._modelMetadataProvider.getModelCamera(modelIdentifier);

    const modelBaseUrl = await baseUrlPromise;
    const modelMatrix = await modelMatrixPromise;
    const scene = await this._modelDataProvider.getJsonFile(modelBaseUrl, this._blobFileName);
    const cameraConfiguration = await cameraConfigurationPromise;
    return {
      modelBaseUrl,
      modelMatrix,
      cameraConfiguration: transformCameraConfiguration(cameraConfiguration, identityMatrix),
      scene
    };
  }
}
