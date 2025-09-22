/*!
 * Copyright 2025 Cognite AS
 */
import { CompositeShape, Cylinder } from '@reveal/utilities';
import { cdfAnnotationsToObjects } from './cdfAnnotationsToObjects';
import { CdfPointCloudObjectAnnotation, isVolumeAnnotation } from './types';
import { Vector3 } from 'three';
import assert from 'assert';

describe(cdfAnnotationsToObjects.name, () => {
  const ARBITRARY_ANNOTATION_ID = 123;
  const ARBITRARY_ANNOTATION_DM_REF = { externalId: 'annotation-external-id', space: 'annotation-space' };

  const ARBITRARY_VOLUME = new Cylinder(new Vector3(0, 0, 0), new Vector3(1, 1, 1), 2);
  const ARBITRARY_ASSET_REF = { id: 987 };
  const ARBITRARY_INSTANCE_REF = { externalId: 'some-external-id', space: 'space' };

  test('returns empty list on empty input', () => {
    expect(cdfAnnotationsToObjects([])).toEqual([]);
  });

  test.each([
    {},
    { asset: ARBITRARY_ASSET_REF },
    { assetInstanceRef: ARBITRARY_INSTANCE_REF },
    { asset: ARBITRARY_ASSET_REF, assetInstanceRef: ARBITRARY_INSTANCE_REF }
  ])('returns annotation with input volume and extra volume metadata %s', extraMetadataVolumeMetadata => {
    const input: CdfPointCloudObjectAnnotation = {
      volumeMetadata: { annotationId: ARBITRARY_ANNOTATION_ID, ...extraMetadataVolumeMetadata },
      region: [ARBITRARY_VOLUME]
    };

    assert(isVolumeAnnotation(input.volumeMetadata));

    expect(cdfAnnotationsToObjects([input])).toEqual([
      {
        boundingBox: ARBITRARY_VOLUME.createBoundingBox(),
        stylableObject: { shape: new CompositeShape([ARBITRARY_VOLUME]), objectId: 1 },
        annotationId: ARBITRARY_ANNOTATION_ID,
        instanceRef: input.volumeMetadata.assetInstanceRef,
        assetRef: input.volumeMetadata.asset
      }
    ]);
  });

  test('returns annotation with input volume for DM annotation', () => {
    const input: CdfPointCloudObjectAnnotation = {
      volumeMetadata: { instanceRef: ARBITRARY_ANNOTATION_DM_REF, asset: ARBITRARY_INSTANCE_REF },
      region: [ARBITRARY_VOLUME]
    };

    expect(cdfAnnotationsToObjects([input])).toEqual([
      {
        boundingBox: ARBITRARY_VOLUME.createBoundingBox(),
        stylableObject: { shape: new CompositeShape([ARBITRARY_VOLUME]), objectId: 1 },
        volumeInstanceRef: ARBITRARY_ANNOTATION_DM_REF,
        assetRef: ARBITRARY_INSTANCE_REF
      }
    ]);
  });
});
