/*!
 * Copyright 2022 Cognite AS
 */

import { createPointCloudModel } from '../../../test-utilities/src/createPointCloudModel';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import { AnnotationIdPointCloudObjectCollection } from './styling/AnnotationListPointCloudObjectCollection';

describe(CognitePointCloudModel.name, () => {
  let model: CognitePointCloudModel;

  beforeEach(() => {
    model = createPointCloudModel(1, 2);
  });

  test('default CognitePointCloudModel does not contain annotations', () => {
    expect(model.stylableObjectCount).toEqual(0);
  });

  test('assigned styled object collection is available in styledCollections', () => {
    const annotationIds = [1, 2, 3];
    const color: [number, number, number] = [255, 0, 127];

    model.assignStyledObjectCollection(new AnnotationIdPointCloudObjectCollection(annotationIds), { color });

    const collections = model.styledCollections;

    expect(collections).toHaveLength(1);
    expect(collections[0].style.color).toEqual(color);
    expect([...collections[0].objectCollection.getAnnotationIds()]).toEqual(annotationIds);
  });

  test('Removing all styled object collection leaves zero collections', () => {
    const annotationIds = [1, 2, 3];
    const color: [number, number, number] = [255, 0, 127];

    model.assignStyledObjectCollection(new AnnotationIdPointCloudObjectCollection(annotationIds), { color });

    model.removeAllStyledObjectCollections();
    expect(model.styledCollections).toHaveLength(0);
  });

  test('Unassigning collection removes the right one', () => {
    const annotationIds0 = [1, 2, 3];
    const annotationIds1 = [4, 5, 6];
    const color0: [number, number, number] = [127, 0, 255];
    const color1: [number, number, number] = [0, 127, 255];

    const collection0 = new AnnotationIdPointCloudObjectCollection(annotationIds0);
    const collection1 = new AnnotationIdPointCloudObjectCollection(annotationIds1);

    model.assignStyledObjectCollection(collection0, { color: color0 });

    model.assignStyledObjectCollection(collection1, { color: color1 });

    expect(model.styledCollections).toHaveLength(2);

    model.unassignStyledObjectCollection(collection0);

    expect(model.styledCollections).toHaveLength(1);
    expect([...model.styledCollections[0].objectCollection.getAnnotationIds()]).toEqual(annotationIds1);
  });
});
