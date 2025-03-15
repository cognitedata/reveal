/*!
 * Copyright 2025 Cognite AS
 */
import {
  classic360AnnotationFixture,
  coreDm360AnnotationFixture
} from '#test-utils/fixtures/image360Annotations';
import { describe, it, expect } from 'vitest';
import { getImage360AnnotationId } from './getImage360AnnotationId';

describe(getImage360AnnotationId.name, () => {
  it('gets annotation ID from classic annotation', () => {
    const result = getImage360AnnotationId(classic360AnnotationFixture);

    expect(result).toBe(classic360AnnotationFixture.id);
  });

  it('gets annotation ID from FDM annotation', () => {
    const result = getImage360AnnotationId(coreDm360AnnotationFixture);

    expect(result).toStrictEqual(coreDm360AnnotationFixture.annotationIdentifier);
  });
});
