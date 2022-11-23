/*!
 * Copyright 2022 Cognite AS
 */

import { createPointCloudModel } from '../../../test-utilities/src/createPointCloudModel';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import { AnnotationIdPointCloudObjectCollection } from '@reveal/pointcloud-styling';

import { Color, Matrix4 } from 'three';

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
    const color = new Color(1.0, 0.0, 0.498);

    model.assignStyledObjectCollection(new AnnotationIdPointCloudObjectCollection(annotationIds), { color });

    const collections = model.styledCollections;

    expect(collections).toHaveLength(1);
    expect(collections[0].style.color).toEqual(color);
    expect([...collections[0].objectCollection.getAnnotationIds()]).toEqual(annotationIds);
  });

  test('Removing all styled object collection leaves zero collections', () => {
    const annotationIds = [1, 2, 3];
    const color = new Color(1.0, 0.0, 0.498);

    model.assignStyledObjectCollection(new AnnotationIdPointCloudObjectCollection(annotationIds), { color });

    model.removeAllStyledObjectCollections();
    expect(model.styledCollections).toHaveLength(0);
  });

  test('Unassigning collection removes the right one', () => {
    const annotationIds0 = [1, 2, 3];
    const annotationIds1 = [4, 5, 6];
    const color0 = new Color(0.498, 0.0, 1.0);
    const color1 = new Color(0.0, 0.498, 1.0);

    const collection0 = new AnnotationIdPointCloudObjectCollection(annotationIds0);
    const collection1 = new AnnotationIdPointCloudObjectCollection(annotationIds1);

    model.assignStyledObjectCollection(collection0, { color: color0 });
    model.assignStyledObjectCollection(collection1, { color: color1 });

    expect(model.styledCollections).toHaveLength(2);

    model.unassignStyledObjectCollection(collection0);

    expect(model.styledCollections).toHaveLength(1);
    expect([...model.styledCollections[0].objectCollection.getAnnotationIds()]).toEqual(annotationIds1);
  });

  test('setModelTransform() changes custom transform, not source transform', () => {
    const originalCustomTransform = model.getModelTransformation();
    const originalSourceTransform = model.getCdfToDefaultModelTransformation();

    const modifyingTransform = new Matrix4().setPosition(1, 2, 3);

    model.setModelTransformation(modifyingTransform);

    const newTransform = model.getModelTransformation();

    expect(originalCustomTransform).not.toEqual(newTransform);
    expect(newTransform).toEqual(modifyingTransform);

    expect(model.getCdfToDefaultModelTransformation()).toEqual(originalSourceTransform);
  });
});
