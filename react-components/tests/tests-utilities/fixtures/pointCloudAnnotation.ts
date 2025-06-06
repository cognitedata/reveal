import { AnnotationModel } from '@cognite/sdk';

export function createPointCloudAnnotationMock(params?: {
  assetId?: number;
  modelId?: number;
}): AnnotationModel {
  return {
    id: Math.random(),
    annotatedResourceId: params?.modelId ?? 123,
    annotatedResourceType: 'threedmodel',
    annotationType: 'threed.BoundingVolume',
    data: {
      assetRef: { id: params?.assetId ?? 0 },
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
