/*!
 * Copyright 2022 Cognite AS
 */

import { AnnotationIdPointCloudObjectCollection } from './AnnotationIdPointCloudObjectCollection';

describe(AnnotationIdPointCloudObjectCollection.name, () => {
  test('returns excactly the provided annotation IDs', () => {
    const annotationIds = [123, 4909, 12312039, 0];

    const collection = new AnnotationIdPointCloudObjectCollection(annotationIds);

    const returnedIds = [...collection.getAnnotationIds()];

    expect(returnedIds).toHaveLength(annotationIds.length);
    expect(returnedIds).toContainAllValues(annotationIds);
  });
});
