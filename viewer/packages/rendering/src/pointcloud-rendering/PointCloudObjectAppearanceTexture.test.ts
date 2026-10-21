/*!
 * Copyright 2022 Cognite AS
 */

import type { ClassicDataSourceType } from '@reveal/data-providers';
import { PointCloudObjectAppearanceTexture } from './PointCloudObjectAppearanceTexture';
import {
  AnnotationIdPointCloudObjectCollection,
  PointCloudDMVolumeCollection,
  DefaultPointCloudAppearance,
  StyledPointCloudVolumeCollection
} from '@reveal/pointcloud-styling';

import { Color } from 'three';
import type { Mock } from 'vitest';
import { vi } from 'vitest';
import type { DMInstanceKey, DMInstanceRef } from '@reveal/utilities';
import { dmInstanceRefToKey, createUint8View } from '@reveal/utilities';
import { assert } from '@reveal/utilities/assert';

const textureWidth = 10;
const textureHeight = 10;

function toByteTuple(color: Color): [number, number, number] {
  return color.toArray().map(c => Math.round(c * 255)) as [number, number, number];
}

describe(PointCloudObjectAppearanceTexture.name, () => {
  const OBJECT_ID0 = 89;

  let appearanceTexture: PointCloudObjectAppearanceTexture;

  beforeEach(() => {
    appearanceTexture = new PointCloudObjectAppearanceTexture(textureWidth, textureHeight);
  });

  test('color is correctly set for one object with annotation Id', () => {
    const color = new Color(0.5, 0.0, 1.0);
    const colorBytes = toByteTuple(color);

    const annotationId = 1223423;

    const objectSet = new AnnotationIdPointCloudObjectCollection([annotationId]);
    const stylableObjectSet = new StyledPointCloudVolumeCollection(objectSet, {
      color,
      visible: true
    });

    const objectsMaps = {
      annotationToObjectIds: new Map<number, number>([[annotationId, OBJECT_ID0]]),
      objectToAnnotationIds: new Map<number, number>([[OBJECT_ID0, annotationId]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const textureData = rawTexture.image.data;
    assert(textureData !== null);
    const resultRgb = createUint8View(textureData).slice(4 * OBJECT_ID0, 4 * (OBJECT_ID0 + 1));

    expect([...resultRgb.values()]).toEqual([...colorBytes, 1]);

    // Check that all other objects are unchanged
    for (let i = 0; i < textureData.byteLength; i += 4) {
      // Ignore the modified object
      if (i >= 4 * OBJECT_ID0 && i < 4 * (OBJECT_ID0 + 1)) {
        continue;
      }

      const data = createUint8View(textureData).slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });

  test('color is correctly set for one object with point cloud volume reference', () => {
    const color = new Color(0.5, 0.0, 1.0);
    const colorBytes = toByteTuple(color);

    const volumeIntanceRef = { externalId: '123', space: 'space' };

    const objectSet = new PointCloudDMVolumeCollection([volumeIntanceRef]);
    const stylableObjectSet = new StyledPointCloudVolumeCollection(objectSet, { color, visible: true });

    const objectsMaps = {
      annotationToObjectIds: new Map<DMInstanceKey, number>([[dmInstanceRefToKey(volumeIntanceRef), OBJECT_ID0]]),
      objectToAnnotationIds: new Map<number, DMInstanceRef>([[OBJECT_ID0, volumeIntanceRef]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const textureData = rawTexture.image.data;
    assert(textureData !== null);
    const resultRgb = createUint8View(textureData).slice(4 * OBJECT_ID0, 4 * (OBJECT_ID0 + 1));

    expect([...resultRgb.values()]).toEqual([...colorBytes, 1]);

    // Check that all other objects are unchanged
    for (let i = 0; i < textureData.byteLength; i += 4) {
      // Ignore the modified object
      if (i >= 4 * OBJECT_ID0 && i < 4 * (OBJECT_ID0 + 1)) {
        continue;
      }

      const data = createUint8View(textureData).slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });

  test('visibility is correctly set for one object with annotation Id', () => {
    const annotationId = 3945873;

    const objectSet = new AnnotationIdPointCloudObjectCollection([annotationId]);
    const stylableObjectSet = new StyledPointCloudVolumeCollection<ClassicDataSourceType>(objectSet, {
      color: new Color('black'),
      visible: false
    });

    const objectsMaps = {
      annotationToObjectIds: new Map<number, number>([[annotationId, OBJECT_ID0]]),
      objectToAnnotationIds: new Map<number, number>([[OBJECT_ID0, annotationId]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const textureData = rawTexture.image.data;
    assert(textureData !== null);
    const resultRgb = createUint8View(textureData).slice(4 * OBJECT_ID0, 4 * (OBJECT_ID0 + 1));

    expect([...resultRgb.values()]).toEqual([0, 0, 0, 0]);

    for (let i = 0; i < textureData.byteLength; i += 4) {
      // Ignore the modified object
      if (i >= 4 * OBJECT_ID0 && i < 4 * (OBJECT_ID0 + 1)) {
        continue;
      }

      const data = createUint8View(textureData).slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });

  test('visibility is correctly set for one object with point cloud volume reference', () => {
    const volumeIntanceRef = { externalId: '123', space: 'space' };

    const objectSet = new PointCloudDMVolumeCollection([volumeIntanceRef]);
    const stylableObjectSet = new StyledPointCloudVolumeCollection(objectSet, {
      color: new Color('black'),
      visible: false
    });

    const objectsMaps = {
      annotationToObjectIds: new Map<DMInstanceKey, number>([[dmInstanceRefToKey(volumeIntanceRef), OBJECT_ID0]]),
      objectToAnnotationIds: new Map<number, DMInstanceRef>([[OBJECT_ID0, volumeIntanceRef]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const textureData = rawTexture.image.data;
    assert(textureData !== null);
    const resultRgb = createUint8View(textureData).slice(4 * OBJECT_ID0, 4 * (OBJECT_ID0 + 1));

    expect([...resultRgb.values()]).toEqual([0, 0, 0, 0]);

    for (let i = 0; i < textureData.byteLength; i += 4) {
      // Ignore the modified object
      if (i >= 4 * OBJECT_ID0 && i < 4 * (OBJECT_ID0 + 1)) {
        continue;
      }

      const data = createUint8View(textureData).slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });

  test('styling is sorted by importance', () => {
    const volumeIntanceRef = { externalId: '123', space: 'space' };

    const objectSet0 = new PointCloudDMVolumeCollection([volumeIntanceRef]);
    const objectSet1 = new PointCloudDMVolumeCollection([volumeIntanceRef]);

    const objectsMaps = {
      annotationToObjectIds: new Map<DMInstanceKey, number>([[dmInstanceRefToKey(volumeIntanceRef), OBJECT_ID0]]),
      objectToAnnotationIds: new Map<number, DMInstanceRef>([[OBJECT_ID0, volumeIntanceRef]])
    };

    const stylableObjectSet0 = new StyledPointCloudVolumeCollection(
      objectSet0,
      {
        color: new Color('black'),
        visible: true
      },
      0
    );

    const stylableObjectSet1 = new StyledPointCloudVolumeCollection(
      objectSet1,
      {
        color: new Color('red'),
        visible: false
      },
      1
    );

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet0);
    appearanceTexture.assignStyledObjectSet(stylableObjectSet1);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const textureData = rawTexture.image.data;
    assert(textureData !== null);
    const resultRgb0 = createUint8View(textureData).slice(4 * OBJECT_ID0, 4 * (OBJECT_ID0 + 1));

    expect([...resultRgb0.values()]).toEqual([255, 0, 0, 0]);

    // swap importance
    stylableObjectSet0.importance = 1;
    stylableObjectSet1.importance = 0;

    appearanceTexture.assignStyledObjectSet(stylableObjectSet0);
    appearanceTexture.assignStyledObjectSet(stylableObjectSet1);
    appearanceTexture.onBeforeRender();

    const resultRgb1 = createUint8View(textureData).slice(4 * OBJECT_ID0, 4 * (OBJECT_ID0 + 1));

    expect([...resultRgb1.values()]).toEqual([0, 0, 0, 1]);
  });

  describe('onVisibilityChanged', () => {
    const ANNOTATION_ID = 7;
    const objectsMaps = {
      annotationToObjectIds: new Map<number, number>([[ANNOTATION_ID, OBJECT_ID0]]),
      objectToAnnotationIds: new Map<number, number>([[OBJECT_ID0, ANNOTATION_ID]])
    };
    let onVisibilityChanged: Mock<() => void>;

    const createStyledSet = (appearance: { color: Color; visible: boolean }) =>
      new StyledPointCloudVolumeCollection<ClassicDataSourceType>(
        new AnnotationIdPointCloudObjectCollection([ANNOTATION_ID]),
        appearance
      );

    beforeEach(() => {
      onVisibilityChanged = vi.fn();
      appearanceTexture.onVisibilityChanged = onVisibilityChanged;
      appearanceTexture.setObjectsMaps(objectsMaps);
    });

    test('is not called when only the color changes', () => {
      appearanceTexture.assignStyledObjectSet(createStyledSet({ color: new Color('red'), visible: true }));
      appearanceTexture.onBeforeRender();

      expect(onVisibilityChanged).not.toHaveBeenCalled();
    });

    test('is called when an object becomes hidden, and again when it becomes visible', () => {
      const hidden = createStyledSet({ color: new Color('red'), visible: false });
      appearanceTexture.assignStyledObjectSet(hidden);
      appearanceTexture.onBeforeRender();
      expect(onVisibilityChanged).toHaveBeenCalledTimes(1);

      appearanceTexture.removeStyledObjectSet(hidden.volumeCollection);
      appearanceTexture.onBeforeRender();
      expect(onVisibilityChanged).toHaveBeenCalledTimes(2);
    });

    test('is not called when an already hidden object only changes color', () => {
      appearanceTexture.assignStyledObjectSet(createStyledSet({ color: new Color('red'), visible: false }));
      appearanceTexture.onBeforeRender();
      onVisibilityChanged.mockClear();

      appearanceTexture.assignStyledObjectSet(createStyledSet({ color: new Color('blue'), visible: false }));
      appearanceTexture.onBeforeRender();

      expect(onVisibilityChanged).not.toHaveBeenCalled();
    });

    test('is called when the default appearance hides everything', () => {
      appearanceTexture.defaultAppearance = { ...DefaultPointCloudAppearance, visible: false };
      appearanceTexture.onBeforeRender();

      expect(onVisibilityChanged).toHaveBeenCalledTimes(1);
    });
  });
});
