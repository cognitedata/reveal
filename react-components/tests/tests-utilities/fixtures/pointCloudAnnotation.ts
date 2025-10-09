import { type PointCloudAnnotationModel } from '../../../src/components/CacheProvider/types';

export function createPointCloudAnnotationMock(params?: {
  annotationId?: number;
  assetId?: number;
  dmIdentifier?: { space: string; externalId: string };
  modelId?: number;
}): PointCloudAnnotationModel {
  return {
    id: params?.annotationId ?? Math.random(),
    annotatedResourceId: params?.modelId ?? 123,
    annotatedResourceType: 'threedmodel',
    annotationType: 'pointcloud.BoundingVolume',
    data: {
      assetRef: params?.assetId !== undefined ? { id: params.assetId } : undefined,
      instanceRef:
        params?.dmIdentifier !== undefined
          ? {
              ...params.dmIdentifier,
              instanceType: 'node',
              sources: [
                {
                  externalId: 'source-external-id',
                  space: 'source-space',
                  type: 'view' as const,
                  version: '1'
                }
              ]
            }
          : undefined,
      region: []
    },
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
    status: 'approved',
    creatingApp: 'test-app',
    creatingAppVersion: 'test-version',
    creatingUser: 'test-user'
  };
}
