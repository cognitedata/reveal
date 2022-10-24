/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectAppearanceTexture } from './PointCloudObjectAppearanceTexture';
import { AnnotationIdPointCloudObjectCollection, StyledPointCloudObjectCollection } from '@reveal/pointcloud-styling';

const textureWidth = 10;
const textureHeight = 10;

describe(PointCloudObjectAppearanceTexture.name, () => {
  let appearanceTexture: PointCloudObjectAppearanceTexture;

  beforeEach(() => {
    appearanceTexture = new PointCloudObjectAppearanceTexture(textureWidth, textureHeight);
  });

  test('color is correctly set for one object', () => {
    const color: [number, number, number] = [128, 0, 255];

    const annotationId = 1223423;
    const objectId = 5;

    const objectSet = new AnnotationIdPointCloudObjectCollection([annotationId]);
    const stylableObjectSet = new StyledPointCloudObjectCollection(objectSet, { color, visible: true });

    const objectsMaps = {
      annotationToObjectIds: new Map<number, number>([[annotationId, objectId]]),
      objectToAnnotationIds: new Map<number, number>([[objectId, annotationId]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const resultRgb = rawTexture.image.data.slice(4 * objectId, 4 * (objectId + 1));

    expect([...resultRgb.values()]).toEqual([...color, 1]);

    // Check that all other objects are unchanged
    for (let i = 0; i < rawTexture.image.data.length; i += 4) {
      // Ignore the modified object
      if (i >= 4 * objectId && i < 4 * (objectId + 1)) {
        continue;
      }

      const data = rawTexture.image.data.slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });

  test('visibility is correctly set for one object', () => {
    const annotationId = 3945873;
    const objectId = 89;

    const objectSet = new AnnotationIdPointCloudObjectCollection([annotationId]);
    const stylableObjectSet = new StyledPointCloudObjectCollection(objectSet, { color: [0, 0, 0], visible: false });

    const objectsMaps = {
      annotationToObjectIds: new Map<number, number>([[annotationId, objectId]]),
      objectToAnnotationIds: new Map<number, number>([[objectId, annotationId]])
    };

    appearanceTexture.setObjectsMaps(objectsMaps);

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const resultRgb = rawTexture.image.data.slice(4 * objectId, 4 * (objectId + 1));

    expect([...resultRgb.values()]).toEqual([0, 0, 0, 0]);

    for (let i = 0; i < rawTexture.image.data.length; i += 4) {
      // Ignore the modified object
      if (i >= 4 * objectId && i < 4 * (objectId + 1)) {
        continue;
      }

      const data = rawTexture.image.data.slice(i, i + 4);
      expect([...data.values()]).toStrictEqual([0, 0, 0, 1]);
    }
  });
});
