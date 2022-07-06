/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectAppearanceTexture } from './PointCloudObjectAppearanceTexture';
import { AnnotationListStylableObjectCollection } from '../../styling/AnnotationListPointCloudObjectCollection';
import { StylablePointCloudObjectCollection } from '../../styling/StyledPointCloudObjectCollection';

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

    const objectSet = new AnnotationListStylableObjectCollection([annotationId]);
    const stylableObjectSet = new StylablePointCloudObjectCollection(objectSet, { color, visible: true });

    appearanceTexture.setAnnotationIdToObjectIdMap(new Map<number, number>([[annotationId, objectId]]));

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

    const objectSet = new AnnotationListStylableObjectCollection([annotationId]);
    const stylableObjectSet = new StylablePointCloudObjectCollection(objectSet, { color: [0, 0, 0], visible: false });

    appearanceTexture.setAnnotationIdToObjectIdMap(new Map<number, number>([[annotationId, objectId]]));

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
