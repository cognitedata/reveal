import { AnnotationModel } from '@cognite/sdk';
import { getAnnotationId, getImage360AnnotationAssetRef } from './getId';
import { ImageAssetLinkAnnotationInfo } from '@cognite/reveal';
import { getIdForImage360Annotation } from '../../components/CacheProvider/utils';
import {
  classic360AnnotationFixture,
  coreDm360AnnotationFixture
} from '../../../tests/tests-utilities/fixtures/image360Annotations';
import { describe, it, expect } from 'vitest';

describe(getAnnotationId.name, () => {
  it('gets annotation ID from classic annotation', () => {
    const result = getAnnotationId(classic360AnnotationFixture);

    expect(result).toBe(classic360AnnotationFixture.id);
  });

  it('gets annotation ID from FDM annotation', () => {
    const result = getAnnotationId(coreDm360AnnotationFixture);

    expect(result).toStrictEqual(coreDm360AnnotationFixture.annotationIdentifier);
  });
});

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
