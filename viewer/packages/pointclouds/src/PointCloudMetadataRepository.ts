/*!
 * Copyright 2021 Cognite AS
 */

import type { PointCloudMetadata } from './PointCloudMetadata';
import type { MetadataRepository } from '@reveal/model-base';

import { transformCameraConfiguration } from '@reveal/utilities';

import type {
  ModelDataProvider,
  ModelMetadataProvider,
  ModelIdentifier,
  BlobOutputMetadata,
  MetadataWithSignedFiles,
  SignedFileItem
} from '@reveal/data-providers';
import { File3dFormat, DMModelIdentifier } from '@reveal/data-providers';
import type { EptJson } from './potree-three-loader/loading/EptJson';

const ROOT_NODE_KEY = '0-0-0-0';
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

    const signedFilesBaseUrlPromise =
      modelIdentifier instanceof DMModelIdentifier
        ? this._modelMetadataProvider.getModelUriForSignedFiles?.(modelIdentifier)
        : Promise.resolve(undefined);

    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(modelIdentifier, File3dFormat.EptPointCloud);
    const cameraConfigurationPromise = this._modelMetadataProvider.getModelCamera(modelIdentifier);
    const [modelBaseUrl, signedFilesBaseUrl, modelMatrix] = await Promise.all([
      baseUrlPromise,
      signedFilesBaseUrlPromise,
      modelMatrixPromise
    ]);
    const jsonData =
      modelIdentifier instanceof DMModelIdentifier && signedFilesBaseUrl !== undefined
        ? await this.loadPointCloudMetadataFromSignedFiles(modelIdentifier, signedFilesBaseUrl, this._blobFileName)
        : await this.loadPointCloudMetadataFromBaseUrl(modelBaseUrl, this._blobFileName);
    const scene = jsonData.fileData;
    const cameraConfiguration = await cameraConfigurationPromise;
    return {
      modelIdentifier: modelIdentifier,
      format: output.format as File3dFormat,
      formatVersion: output.version,
      modelBaseUrl,
      signedFilesBaseUrl,
      modelMatrix,
      cameraConfiguration: transformCameraConfiguration(cameraConfiguration, modelMatrix),
      scene,
      signedFiles: jsonData.signedFiles
    };
  }

  private async loadPointCloudMetadataFromSignedFiles(
    modelIdentifier: DMModelIdentifier,
    signedFilesBaseUrl: string,
    fileName: string
  ): Promise<MetadataWithSignedFiles<EptJson>> {
    if (this._modelDataProvider.getFileUrlsForModel === undefined) {
      throw new Error('Model data provider does not support signed file fetching');
    }

    const rootHierarchyPath = `ept-hierarchy/${ROOT_NODE_KEY}.json`;
    const eptItemsPromise = this._modelDataProvider.getFileUrlsForModel(signedFilesBaseUrl, modelIdentifier, fileName);
    const rootHierarchyItemsPromise = this._modelDataProvider.getFileUrlsForModel(
      signedFilesBaseUrl,
      modelIdentifier,
      rootHierarchyPath
    );

    const signedFilesItems: SignedFileItem[] = [];
    void this._modelDataProvider
      .getFileUrlsForModel(signedFilesBaseUrl, modelIdentifier)
      .then(items => {
        signedFilesItems.push(...items);
      })
      .catch(error => {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `[PointCloudMetadataRepository] Background preload of signed-files list failed; nodes will resolve signed URLs on demand via filter. ${message}`
        );
      });

    const [eptItems, rootHierarchyItems] = await Promise.all([eptItemsPromise, rootHierarchyItemsPromise]);
    const eptItem = eptItems.find(item => item.fileName === fileName || item.fileName.endsWith('/' + fileName));
    if (eptItem === undefined) {
      throw new Error(`File "${fileName}" not found in signed files response`);
    }
    const rootHierarchyItem = rootHierarchyItems.find(
      item => item.fileName === rootHierarchyPath || item.fileName.endsWith('/' + rootHierarchyPath)
    );

    const rootHierarchyWarmPromise: Promise<unknown> = rootHierarchyItem
      ? this._modelDataProvider.getJsonFile('', rootHierarchyItem.signedUrl).catch(() => undefined)
      : Promise.resolve(undefined);
    const [fileData] = await Promise.all([
      this._modelDataProvider.getJsonFile('', eptItem.signedUrl),
      rootHierarchyWarmPromise
    ]);

    return {
      signedFiles: { items: signedFilesItems },
      fileData: fileData as EptJson
    };
  }

  private async loadPointCloudMetadataFromBaseUrl(
    baseUrl: string,
    fileName: string
  ): Promise<MetadataWithSignedFiles<EptJson>> {
    const fileData = await this._modelDataProvider.getJsonFile(baseUrl, fileName);
    return {
      signedFiles: { items: [] },
      fileData: fileData as EptJson
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
