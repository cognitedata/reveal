/*!
 * Copyright 2025 Cognite AS
 */

import { AnnotationModel, AnnotationsTypesImagesInstanceLink } from '@cognite/sdk';

export function createAnnotationModel(overrides: Partial<AnnotationModel>): AnnotationModel {
  const defaultData: AnnotationsTypesImagesInstanceLink = {
    text: 'default-text',
    textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.1 },
    instanceRef: {
      instanceType: 'node',
      externalId: 'default-instance',
      space: 'default-space',
      sources: []
    }
  };

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
    data: defaultData,
    ...overrides
  };
}
