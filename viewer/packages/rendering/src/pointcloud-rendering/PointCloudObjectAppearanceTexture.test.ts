/*!
 * Copyright 2022 Cognite AS
 */

import { ClassicDataSourceType } from '@reveal/data-providers';
import { PointCloudObjectAppearanceTexture } from './PointCloudObjectAppearanceTexture';
import {
  AnnotationIdPointCloudObjectCollection,
  PointCloudDMVolumeCollection,
  StyledPointCloudVolumeCollection
} from '@reveal/pointcloud-styling';

import { Color } from 'three';
import { DMInstanceKey, DMInstanceRef, dmInstanceRefToKey } from '@reveal/utilities';
import { createUint8View } from '@reveal/utilities/src/bufferUtils';

const textureWidth = 10;
const textureHeight = 10;

function toByteTuple(color: Color): [number, number, number] {
  return color.toArray().map(c => Math.round(c * 255)) as [number, number, number];
}

describe(PointCloudObjectAppearanceTexture.name, () => {
  let appearanceTexture: PointCloudObjectAppearanceTexture;

  beforeEach(() => {
    appearanceTexture = new PointCloudObjectAppearanceTexture(textureWidth, textureHeight);
  });

  test('color is correctly set for one object with annotation Id', () => {
    const color = new Color(0.5, 0.0, 1.0);
    const colorBytes = toByteTuple(color);

    const annotationId = 1223423;
    const objectId = 5;

    const objectSet = new AnnotationIdPointCloudObjectCollection([annotationId]);
    const stylableObjectSet = new StyledPointCloudVolumeCollection(objectSet, {
      color,
      visible: true
    });

    const objectsMaps = {
      annotationToObjectIds: new Map<number, number>([[annotationId, objectId]]),
      objectToAnnotationIds: new Map<number, number>([[objectId, annotationId]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const resultRgb = createUint8View(rawTexture.image.data).slice(4 * objectId, 4 * (objectId + 1));

    expect([...resultRgb.values()]).toEqual([...colorBytes, 1]);

    // Check that all other objects are unchanged
    for (let i = 0; i < rawTexture.image.data.byteLength; i += 4) {
      // Ignore the modified object
      if (i >= 4 * objectId && i < 4 * (objectId + 1)) {
        continue;
      }

      const data = createUint8View(rawTexture.image.data).slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });

  test('color is correctly set for one object with point cloud volume reference', () => {
    const color = new Color(0.5, 0.0, 1.0);
    const colorBytes = toByteTuple(color);

    const volumeIntanceRef = { externalId: '123', space: 'space' };
    const objectId = 5;

    const objectSet = new PointCloudDMVolumeCollection([volumeIntanceRef]);
    const stylableObjectSet = new StyledPointCloudVolumeCollection(objectSet, { color, visible: true });

    const objectsMaps = {
      annotationToObjectIds: new Map<DMInstanceKey, number>([[dmInstanceRefToKey(volumeIntanceRef), objectId]]),
      objectToAnnotationIds: new Map<number, DMInstanceRef>([[objectId, volumeIntanceRef]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const resultRgb = createUint8View(rawTexture.image.data).slice(4 * objectId, 4 * (objectId + 1));

    expect([...resultRgb.values()]).toEqual([...colorBytes, 1]);

    // Check that all other objects are unchanged
    for (let i = 0; i < rawTexture.image.data.byteLength; i += 4) {
      // Ignore the modified object
      if (i >= 4 * objectId && i < 4 * (objectId + 1)) {
        continue;
      }

      const data = createUint8View(rawTexture.image.data).slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });

  test('visibility is correctly set for one object with annotation Id', () => {
    const annotationId = 3945873;
    const objectId = 89;

    const objectSet = new AnnotationIdPointCloudObjectCollection([annotationId]);
    const stylableObjectSet = new StyledPointCloudVolumeCollection<ClassicDataSourceType>(objectSet, {
      color: new Color('black'),
      visible: false
    });

    const objectsMaps = {
      annotationToObjectIds: new Map<number, number>([[annotationId, objectId]]),
      objectToAnnotationIds: new Map<number, number>([[objectId, annotationId]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const resultRgb = createUint8View(rawTexture.image.data).slice(4 * objectId, 4 * (objectId + 1));

    expect([...resultRgb.values()]).toEqual([0, 0, 0, 0]);

    for (let i = 0; i < rawTexture.image.data.byteLength; i += 4) {
      // Ignore the modified object
      if (i >= 4 * objectId && i < 4 * (objectId + 1)) {
        continue;
      }

      const data = createUint8View(rawTexture.image.data).slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });

  test('visibility is correctly set for one object with point cloud volume reference', () => {
    const volumeIntanceRef = { externalId: '123', space: 'space' };
    const objectId = 89;

    const objectSet = new PointCloudDMVolumeCollection([volumeIntanceRef]);
    const stylableObjectSet = new StyledPointCloudVolumeCollection(objectSet, {
      color: new Color('black'),
      visible: false
    });

    const objectsMaps = {
      annotationToObjectIds: new Map<DMInstanceKey, number>([[dmInstanceRefToKey(volumeIntanceRef), objectId]]),
      objectToAnnotationIds: new Map<number, DMInstanceRef>([[objectId, volumeIntanceRef]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const resultRgb = createUint8View(rawTexture.image.data).slice(4 * objectId, 4 * (objectId + 1));

    expect([...resultRgb.values()]).toEqual([0, 0, 0, 0]);

    for (let i = 0; i < rawTexture.image.data.byteLength; i += 4) {
      // Ignore the modified object
      if (i >= 4 * objectId && i < 4 * (objectId + 1)) {
        continue;
      }

      const data = createUint8View(rawTexture.image.data).slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });
});
