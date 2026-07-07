/*!
 * Copyright 2021 Cognite AS
 */

import { Matrix4 } from 'three';

import { CadMetadataParser } from './CadMetadataParser';

import type { SectorScene } from '../utilities/types';
import { getDistanceToMeterConversionFactor } from '../utilities/types';
import type { CadModelMetadata } from './CadModelMetadata';
import type { MetadataRepository } from '@reveal/model-base';
import { transformCameraConfiguration } from '@reveal/utilities';

import type {
  ModelDataProvider,
  ModelMetadataProvider,
  ModelIdentifier,
  BlobOutputMetadata
} from '@reveal/data-providers';
import { File3dFormat, DMModelIdentifier } from '@reveal/data-providers';
import type { CadSceneRootMetadata } from './parsers/types';
import type { MetadataWithSignedFiles } from '@reveal/data-providers/src/metadata-providers/types';

export class CadModelMetadataRepository implements MetadataRepository<Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider;
  private readonly _modelDataProvider: ModelDataProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  private readonly _blobFileName: string;

  constructor(
    modelMetadataProvider: ModelMetadataProvider,
    modelDataProvider: ModelDataProvider,
    blobFileName: string = 'scene.json'
  ) {
    this._cadSceneParser = new CadMetadataParser();
    this._modelMetadataProvider = modelMetadataProvider;
    this._modelDataProvider = modelDataProvider;
    this._blobFileName = blobFileName;
  }

  async loadData(modelIdentifier: ModelIdentifier, outputFormat?: File3dFormat): Promise<CadModelMetadata> {
    const cadOutput = await this.getSupportedOutput(modelIdentifier, outputFormat);
    const blobBaseUrlPromise = this._modelMetadataProvider.getModelUri(modelIdentifier, cadOutput);
    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(modelIdentifier, cadOutput.format);
    const modelCameraPromise = this._modelMetadataProvider.getModelCamera(modelIdentifier);
    const signedFilesBaseUrl = this._modelMetadataProvider.getModelUriForSignedFiles?.() ?? undefined;

    const blobBaseUrl = await blobBaseUrlPromise;
    const json =
      modelIdentifier instanceof DMModelIdentifier && signedFilesBaseUrl !== undefined
        ? await this.loadCadMetadataFromSignedFiles(modelIdentifier, signedFilesBaseUrl, this._blobFileName)
        : await this.loadCadMetadataFromBaseUrl(blobBaseUrl, this._blobFileName);
    const scene: SectorScene = this._cadSceneParser.parse(json);
    const modelMatrix = createScaleToMetersModelMatrix(scene.unit, await modelMatrixPromise);
    const inverseModelMatrix = new Matrix4().copy(modelMatrix).invert();
    const cameraConfiguration = await modelCameraPromise;

    return {
      modelIdentifier,
      modelBaseUrl: blobBaseUrl,
      signedFilesBaseUrl,
      // Clip box is not loaded, it must be set elsewhere
      geometryClipBox: null,
      format: cadOutput.format as File3dFormat,
      formatVersion: cadOutput.version,
      modelMatrix,
      inverseModelMatrix,
      cameraConfiguration: transformCameraConfiguration(cameraConfiguration, modelMatrix),
      scene
    };
  }

  private async loadCadMetadataFromSignedFiles(
    modelIdentifier: DMModelIdentifier,
    signedFilesBaseUrl: string,
    fileName: string
  ): Promise<MetadataWithSignedFiles<CadSceneRootMetadata>> {
    if (this._modelDataProvider.getFileUrlsForModel === undefined) {
      throw new Error('Model data provider does not support signed file fetching');
    }
    const items = await this._modelDataProvider.getFileUrlsForModel(signedFilesBaseUrl, modelIdentifier);
    const found = items.find(item => item.fileName === fileName || item.fileName.endsWith('/' + fileName));

    if (found === undefined) {
      throw new Error(`File "${fileName}" not found in signed files response`);
    }
    const fileData = await this._modelDataProvider.getJsonFile('', found.signedUrl);
    return {
      signedFiles: { items },
      fileData: fileData as CadSceneRootMetadata
    };
  }

  private async loadCadMetadataFromBaseUrl(
    baseUrl: string,
    fileName: string
  ): Promise<MetadataWithSignedFiles<CadSceneRootMetadata>> {
    const jsonData = await this._modelDataProvider.getJsonFile(baseUrl, fileName);
    return {
      signedFiles: undefined,
      fileData: jsonData as CadSceneRootMetadata
    };
  }

  private async getSupportedOutput(
    modelIdentifier: ModelIdentifier,
    outputFormat?: File3dFormat
  ): Promise<BlobOutputMetadata> {
    const outputs = await this._modelMetadataProvider.getModelOutputs(modelIdentifier);

    const targetFormat = outputFormat ?? File3dFormat.GltfCadModel;

    const supportedOutput = outputs.find(output => output.format === targetFormat && output.version === 9);

    if (supportedOutput === undefined) {
      const cadModelOutputsString = outputs.map(output => `${output.format} v${output.version}`).join(', ');
      throw new Error(
        `Model does not contain output of format '${targetFormat}', available outputs: [${cadModelOutputsString}]`
      );
    }

    return supportedOutput;
  }
}

function createScaleToMetersModelMatrix(unit: string, modelMatrix: Matrix4): Matrix4 {
  const conversionFactor = getDistanceToMeterConversionFactor(unit) ?? 1;
  if (conversionFactor === undefined) {
    throw new Error(`Unknown model unit '${unit}'`);
  }
  const scaledModelMatrix = new Matrix4().makeScale(conversionFactor, conversionFactor, conversionFactor);
  return scaledModelMatrix.multiply(modelMatrix);
}
