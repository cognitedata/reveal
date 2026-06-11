/*!
 * Copyright 2026 Cognite AS
 */
import { dmInstanceRefToKey } from '@reveal/utilities';
import { getAnnotationIdKey } from './annotations';
import { createAnnotationModel } from '../../../../test-utilities';
import type { AnnotationModel } from '@cognite/sdk';
import type { CoreDmImage360Annotation } from './cdm/types';

describe(getAnnotationIdKey, () => {
  test('returns DM annotation key', () => {
    const annotationId = { externalId: 'annotation-external-id', space: 'annotation-space' };
    const annotation: CoreDmImage360Annotation = {
      sourceType: 'dm',
      status: 'approved',
      connectedImageId: { externalId: 'image-external-id', space: 'image-space' },
      annotationIdentifier: annotationId,
      polygon: []
    };

    expect(getAnnotationIdKey(annotation)).toBe(dmInstanceRefToKey(annotationId));
  });

  test('returns classic annotation key', () => {
    const annotation: AnnotationModel = createAnnotationModel({ id: 123 });

    expect(getAnnotationIdKey(annotation)).toBe('123');
  });
});
