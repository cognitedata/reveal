import { describe, expect, it } from 'vitest';
import { getImage360AnnotationAssetRef } from './getImage360AnnotationAssetRef';
import {
  classic360AnnotationFixture,
  coreDm360AnnotationFixture
} from '#test-utils/fixtures/image360Annotations';

describe(getImage360AnnotationAssetRef.name, () => {
  it('gets image360 annotation ref from classic annotation', () => {
    const result = getImage360AnnotationAssetRef(classic360AnnotationFixture);

    expect(result).toStrictEqual(classic360AnnotationFixture.data.assetRef);
  });

  it('gets image360 annotation ref from coreDM annotation', () => {
    const result = getImage360AnnotationAssetRef(coreDm360AnnotationFixture);

    expect(result).toStrictEqual(coreDm360AnnotationFixture.assetRef);
  });
});
