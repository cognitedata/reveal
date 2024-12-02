/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { AssetMappingAndNode3DCache } from '../../../components/CacheProvider/AssetMappingAndNode3DCache';
import { FdmNodeCache } from '../../../components/CacheProvider/FdmNodeCache';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import { type Fdm3dDataProvider } from '../../../data-providers/Fdm3dDataProvider';
import { PointCloudAnnotationCache } from '../../../components/CacheProvider/PointCloudAnnotationCache';
import { Image360AnnotationCache } from '../../../components/CacheProvider/Image360AnnotationCache';
import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';

export class CdfCaches {
  private readonly _assetMappingAndNode3dCache: AssetMappingAndNode3DCache;
  private readonly _fdmNodeCache: FdmNodeCache;
  private readonly _pointCloudAnnotationCache: PointCloudAnnotationCache;
  private readonly _image360AnnotationCache: Image360AnnotationCache;

  private readonly _cogniteClient: CogniteClient;

  constructor(
    cdfClient: CogniteClient,
    fdm3dDataProvider: Fdm3dDataProvider,
    viewer: Cognite3DViewer<DataSourceType>
  ) {
    const fdmClient = new FdmSDK(cdfClient);

    this._assetMappingAndNode3dCache = new AssetMappingAndNode3DCache(cdfClient);
    this._fdmNodeCache = new FdmNodeCache(cdfClient, fdmClient, fdm3dDataProvider);
    this._pointCloudAnnotationCache = new PointCloudAnnotationCache(cdfClient);
    this._image360AnnotationCache = new Image360AnnotationCache(cdfClient, viewer);

    this._cogniteClient = cdfClient;
  }

  public get assetMappingAndNode3dCache(): AssetMappingAndNode3DCache {
    return this._assetMappingAndNode3dCache;
  }

  public get fdmNodeCache(): FdmNodeCache {
    return this._fdmNodeCache;
  }

  public get pointCloudAnnotationCache(): PointCloudAnnotationCache {
    return this._pointCloudAnnotationCache;
  }

  public get image360Cache(): Image360AnnotationCache {
    return this._image360AnnotationCache;
  }

  public get cogniteClient(): CogniteClient {
    return this._cogniteClient;
  }
}