import { type CogniteClient } from '@cognite/sdk';
import { ClassicCadAssetMappingCache } from '../../../components/CacheProvider/cad/ClassicAssetMappingCache';
import { FdmCadNodeCache } from '../../../components/CacheProvider/FdmCadNodeCache';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import { PointCloudAnnotationCache } from '../../../components/CacheProvider/PointCloudAnnotationCache';
import { Image360AnnotationCache } from '../../../components/CacheProvider/Image360AnnotationCache';
import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { CoreDm3dFdm3dDataProvider } from '../../../data-providers/core-dm-provider/CoreDm3dDataProvider';
import { LegacyFdm3dDataProvider } from '../../../data-providers/legacy-fdm-provider/LegacyFdm3dDataProvider';
import { type Fdm3dDataProvider } from '../../../data-providers/Fdm3dDataProvider';

export type CdfCachesOptions = {
  coreDmOnly: boolean;
  enableLegacy3dFdm: boolean;
};

export class CdfCaches {
  private readonly _assetMappingAndNode3dCache: ClassicCadAssetMappingCache;
  private readonly _fdmCadNodeCache: FdmCadNodeCache | undefined;
  private readonly _pointCloudAnnotationCache: PointCloudAnnotationCache;
  private readonly _image360AnnotationCache: Image360AnnotationCache;

  private readonly _coreDmOnly: boolean;

  private readonly _cogniteClient: CogniteClient;
  private readonly _fdm3dDataProvider: Fdm3dDataProvider | undefined;

  constructor(
    cdfClient: CogniteClient,
    viewer: Cognite3DViewer<DataSourceType>,
    { coreDmOnly, enableLegacy3dFdm }: CdfCachesOptions
  ) {
    const fdmClient = new FdmSDK(cdfClient);

    const fdm3dDataProvider = (() => {
      if (coreDmOnly) {
        return new CoreDm3dFdm3dDataProvider(fdmClient);
      } else if (enableLegacy3dFdm) {
        return new LegacyFdm3dDataProvider(fdmClient, cdfClient);
      }
      return undefined;
    })();

    this._assetMappingAndNode3dCache = new ClassicCadAssetMappingCache(cdfClient);
    this._pointCloudAnnotationCache = new PointCloudAnnotationCache(cdfClient);
    this._image360AnnotationCache = new Image360AnnotationCache(cdfClient, viewer);

    if (fdm3dDataProvider !== undefined) {
      this._fdmCadNodeCache = new FdmCadNodeCache(cdfClient, fdm3dDataProvider);
    }

    this._cogniteClient = cdfClient;
    this._fdm3dDataProvider = fdm3dDataProvider;
    this._coreDmOnly = coreDmOnly;
  }

  public get classicCadAssetMappingCache(): ClassicCadAssetMappingCache {
    return this._assetMappingAndNode3dCache;
  }

  public get fdmCadNodeCache(): FdmCadNodeCache | undefined {
    return this._fdmCadNodeCache;
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

  public get fdm3dDataProvider(): Fdm3dDataProvider | undefined {
    return this._fdm3dDataProvider;
  }

  public get coreDmOnly(): boolean {
    return this._coreDmOnly;
  }
}
