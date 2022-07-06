/*!
 * Copyright 2022 Cognite AS
 */

import { ObjectAppearanceTexture } from './ObjectAppearanceTexture';
import { AnnotationListStylableObjectCollection } from '../../styling/AnnotationListPointCloudObjectCollection';
import { StylablePointCloudObjectCollection } from '../../styling/StyledPointCloudObjectCollection';

const textureWidth = 10;
const textureHeight = 10;

describe(ObjectAppearanceTexture.name, () => {
  test('color is correctly set for one object', () => {
    const color: [number, number, number] = [128, 0, 255];

    const appearanceTexture = new ObjectAppearanceTexture(textureWidth, textureHeight);

    const objectId = 5;

    const objectSet = new AnnotationListStylableObjectCollection([objectId]);
    const stylableObjectSet = new StylablePointCloudObjectCollection(objectSet, { color, visible: true });

    appearanceTexture.setAnnotationIdToObjectIdMap(new Map<number, number>([[objectId, objectId]]));

    appearanceTexture.assignStyledObjectSet(stylableObjectSet);
    appearanceTexture.onBeforeRender();

    const rawTexture = appearanceTexture.objectStyleTexture;
    const resultRgb = rawTexture.image.data.slice(4 * objectId, 4 * (objectId + 1) - 1);

    console.log("resultRgb: ", resultRgb);
    expect([...resultRgb.values()]).toEqual(color);
  });
});
