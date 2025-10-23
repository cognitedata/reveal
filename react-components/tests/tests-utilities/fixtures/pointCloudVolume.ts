import {
  type ClassicDataSourceType,
  type DMDataSourceType,
  type PointCloudObjectMetadata
} from '@cognite/reveal';
import { Box3 } from 'three';
import { type DmsUniqueIdentifier } from '../../../src';
import { type IdEither } from '@cognite/sdk';

export function createClassicPointCloudVolumeMock(params?: {
  id?: number;
  classicAssetId?: IdEither;
  dmAssetId?: DmsUniqueIdentifier;
}): PointCloudObjectMetadata<ClassicDataSourceType> {
  return {
    boundingBox: new Box3(),
    annotationId: params?.id ?? 123,
    assetRef: params?.classicAssetId,
    instanceRef: params?.dmAssetId
  };
}

export function createDmPointCloudVolumeMock(params?: {
  id?: DmsUniqueIdentifier;
  assetId?: DmsUniqueIdentifier;
}): PointCloudObjectMetadata<DMDataSourceType> {
  return {
    boundingBox: new Box3(),
    volumeInstanceRef: params?.id ?? { externalId: 'volume-external-id', space: 'volume-space' },
    assetRef: params?.assetId
  };
}
