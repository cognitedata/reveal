/*!
 * Copyright 2025 Cognite AS
 */

import { AnnotationData, AnnotationModel } from '@cognite/sdk';

export function createAnnotationModel(overrides: Partial<AnnotationModel>): AnnotationModel {
  return {
    id: 1,
    annotationType: 'images.InstanceLink',
    status: 'approved',
    createdTime: new Date('2025-01-01'),
    lastUpdatedTime: new Date('2025-01-01'),
    annotatedResourceId: 123,
    annotatedResourceType: 'file',
    creatingApp: 'test-app',
    creatingAppVersion: '1.0.0',
    creatingUser: 'test-user',
    data: {} as AnnotationData,
    ...overrides
  };
}
