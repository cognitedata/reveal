/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { PointCloudMetadata } from './PointCloudMetadata';
import { MetadataRepository } from '@reveal/model-base';

import { transformCameraConfiguration } from '@reveal/utilities';

import {
  ModelDataProvider,
  ModelMetadataProvider,
  ModelIdentifier,
  File3dFormat,
  BlobOutputMetadata
} from '@reveal/modeldata-api';

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
    const output = await this.getSupportedOutput(modelIdentifier);
    const baseUrlPromise = this._modelMetadataProvider.getModelUri(modelIdentifier, output);
    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(modelIdentifier, File3dFormat.EptPointCloud);
    const cameraConfigurationPromise = this._modelMetadataProvider.getModelCamera(modelIdentifier);
    const modelBaseUrl = await baseUrlPromise;
    const modelMatrix = await modelMatrixPromise;
    const scene = await this._modelDataProvider.getJsonFile(modelBaseUrl, this._blobFileName);
    const cameraConfiguration = await cameraConfigurationPromise;
    return {
      format: output.format as File3dFormat,
      formatVersion: output.version,
      modelBaseUrl,
      modelMatrix,
      cameraConfiguration: transformCameraConfiguration(cameraConfiguration, modelMatrix),
      scene
    };
  }

  private async getSupportedOutput(modelIdentifier: ModelIdentifier): Promise<BlobOutputMetadata> {
    const outputs = await this._modelMetadataProvider.getModelOutputs(modelIdentifier);
    const pointCloudOutput = outputs.find(output => output.format === File3dFormat.EptPointCloud);

    if (!pointCloudOutput)
      throw new Error(`Model does not contain supported point cloud output [${File3dFormat.EptPointCloud}]`);

    return pointCloudOutput;
  }
}
