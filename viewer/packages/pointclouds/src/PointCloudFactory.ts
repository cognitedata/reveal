/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudNode } from './PointCloudNode';
import type { PointCloudMetadata } from './PointCloudMetadata';

import type { Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';
import type {
  ClassicDataSourceType,
  DMDataSourceType,
  DataSourceType,
  PointCloudStylableObjectProvider
} from '@reveal/data-providers';
import { isDMIdentifier } from '@reveal/data-providers';
import type { IPointClassificationsProvider } from './classificationsProviders/IPointClassificationsProvider';

import type { PointCloudMaterialManager } from '@reveal/rendering';
import { createObjectIdMaps } from './potree-three-loader/utils/createObjectIdMaps';
import { isLocalIdentifier } from '@reveal/data-providers';
import type { ModelIdentifier } from '@reveal/data-providers/src/ModelIdentifier';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _pointCloudObjectProvider: PointCloudStylableObjectProvider<ClassicDataSourceType>;
  private readonly _pointCloudDMProvider: PointCloudStylableObjectProvider<DMDataSourceType>;
  private readonly _classificationsProvider: IPointClassificationsProvider;
  private readonly _pointCloudMaterialManager: PointCloudMaterialManager;

  constructor(
    potreeInstance: Potree,
    pointCloudObjectProvider: PointCloudStylableObjectProvider,
    pointCloudDMProvider: PointCloudStylableObjectProvider<DMDataSourceType>,
    classificationsProvider: IPointClassificationsProvider,
    pointCloudMaterialManager: PointCloudMaterialManager
  ) {
    this._potreeInstance = potreeInstance;
    this._pointCloudObjectProvider = pointCloudObjectProvider;
    this._pointCloudDMProvider = pointCloudDMProvider;
    this._classificationsProvider = classificationsProvider;
    this._pointCloudMaterialManager = pointCloudMaterialManager;
  }

  dispose(): void {
    this._pointCloudMaterialManager.dispose();
  }

  async createModel<T extends DataSourceType>(
    identifier: T['modelIdentifier'],
    modelIdentifier: ModelIdentifier,
    modelMetadata: PointCloudMetadata
  ): Promise<PointCloudNode<T>> {
    const { modelBaseUrl, signedFilesBaseUrl, modelMatrix, cameraConfiguration } = modelMetadata;

    const annotationInfoPromise = isLocalIdentifier(identifier)
      ? this._pointCloudObjectProvider.getPointCloudObjects({ modelId: -1, revisionId: -1 })
      : isDMIdentifier(identifier)
        ? this._pointCloudDMProvider.getPointCloudObjects(identifier)
        : this._pointCloudObjectProvider.getPointCloudObjects(identifier);

    const classSchemaPromise = this._classificationsProvider.getClassifications(modelMetadata);

    const [annotationInfo, classSchema] = await Promise.all([annotationInfoPromise, classSchemaPromise]);

    const stylableObject = annotationInfo.map(obj => obj.stylableObject);

    this._pointCloudMaterialManager.addModelMaterial(
      modelIdentifier.revealInternalId,
      createObjectIdMaps<DataSourceType>(annotationInfo)
    );

    const preloadedEptData =
      modelMetadata.signedFiles && modelMetadata.scene
        ? { signedFiles: modelMetadata.signedFiles, fileData: modelMetadata.scene }
        : undefined;

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      stylableObject,
      modelIdentifier,
      signedFilesBaseUrl,
      preloadedEptData
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PointCloudNode<T>(
      modelIdentifier.revealInternalId,
      modelMatrix,
      pointCloudOctree,
      annotationInfo,
      classSchema,
      cameraConfiguration
    );
  }
}
