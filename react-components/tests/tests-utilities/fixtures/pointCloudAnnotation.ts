import { type AnnotationModel } from '@cognite/sdk';

export function createPointCloudAnnotationMock(params?: {
  assetId?: number;
  dmIdentifier?: { space: string; externalId: string };
  modelId?: number;
}): AnnotationModel {
  return {
    id: Math.random(),
    annotatedResourceId: params?.modelId ?? 123,
    annotatedResourceType: 'threedmodel',
    annotationType: 'threed.BoundingVolume',
    data: {
      assetRef: { id: params?.assetId ?? 0 },
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
