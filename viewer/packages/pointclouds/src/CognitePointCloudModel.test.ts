/*!
 * Copyright 2022 Cognite AS
 */

import { ClassicDataSourceType, DMDataSourceType } from '@reveal/data-providers';
import { createPointCloudModel } from '../../../test-utilities/src/createPointCloudModel';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import { AnnotationIdPointCloudObjectCollection, PointCloudDMVolumeCollection } from '@reveal/pointcloud-styling';

import { Color, Matrix4 } from 'three';

describe(CognitePointCloudModel.name, () => {
  let classicModel: CognitePointCloudModel<ClassicDataSourceType>;
  let dmModel: CognitePointCloudModel<DMDataSourceType>;

  beforeEach(() => {
    classicModel = createPointCloudModel(1, 2);
    dmModel = createPointCloudModel(1, 2);
  });

  test('default CognitePointCloudModel does not contain annotations or core data odel point cloud volume', () => {
    expect(classicModel.stylableObjectCount).toEqual(0);
  });

  test('assigned styled object collection is available in styledCollections for annotation object', () => {
    const annotationIds = [1, 2, 3];
    const color = new Color(1.0, 0.0, 0.498);

    classicModel.assignStyledObjectCollection(new AnnotationIdPointCloudObjectCollection(annotationIds), { color });

    const collections = classicModel.styledCollections;

    expect(collections).toHaveLength(1);
    expect(collections[0].style.color).toEqual(color);
    expect([...collections[0].objectCollection.getAnnotationIds()]).toEqual(annotationIds);
  });

  test('assigned styled object collection is available in styledCollections for core data model object', () => {
    const volumeInstanceRef = [
      { externalId: '1', space: 'test_space' },
      { externalId: '2', space: 'test_space' },
      { externalId: '3', space: 'test_space' }
    ];
    const color = new Color(1.0, 0.0, 0.498);

    dmModel.assignStyledObjectCollection(new PointCloudDMVolumeCollection(volumeInstanceRef), { color });

    const collections = dmModel.styledCollections;

    expect(collections).toHaveLength(1);
    expect(collections[0].style.color).toEqual(color);
    const expectedRefs = Array.from(collections[0].objectCollection.getDataModelInstanceRefs());
    expect(expectedRefs).toEqual(volumeInstanceRef);
  });

  test('Removing all styled object collection leaves zero collections', () => {
    const annotationIds = [1, 2, 3];
    const otherAnnotationIds = [4, 5, 6];
    const color = new Color(1.0, 0.0, 0.498);

    classicModel.assignStyledObjectCollection(new AnnotationIdPointCloudObjectCollection(annotationIds), { color });
    classicModel.assignStyledObjectCollection(new AnnotationIdPointCloudObjectCollection(otherAnnotationIds), {
      color
    });

    classicModel.removeAllStyledObjectCollections();
    expect(classicModel.styledCollections).toHaveLength(0);
  });

  test('Unassigning collection removes the right one for annotation Id collection', () => {
    const annotationIds0 = [1, 2, 3];
    const annotationIds1 = [4, 5, 6];
    const color0 = new Color(0.498, 0.0, 1.0);
    const color1 = new Color(0.0, 0.498, 1.0);

    const collection0 = new AnnotationIdPointCloudObjectCollection(annotationIds0);
    const collection1 = new AnnotationIdPointCloudObjectCollection(annotationIds1);

    classicModel.assignStyledObjectCollection(collection0, { color: color0 });
    classicModel.assignStyledObjectCollection(collection1, { color: color1 });

    expect(classicModel.styledCollections).toHaveLength(2);

    classicModel.unassignStyledObjectCollection(collection0);

    expect(classicModel.styledCollections).toHaveLength(1);
    expect([...classicModel.styledCollections[0].objectCollection.getAnnotationIds()]).toEqual(annotationIds1);
  });

  test('Unassigning collection removes the right one for core point cloud volume collection', () => {
    const volumeInstanceRef1 = [
      { externalId: '1', space: 'test_space' },
      { externalId: '2', space: 'test_space' },
      { externalId: '3', space: 'test_space' }
    ];
    const volumeInstanceRef2 = [
      { externalId: '4', space: 'test_space' },
      { externalId: '5', space: 'test_space' },
      { externalId: '6', space: 'test_space' }
    ];

    const color0 = new Color(0.498, 0.0, 1.0);
    const color1 = new Color(0.0, 0.498, 1.0);

    const collection0 = new PointCloudDMVolumeCollection(volumeInstanceRef1);
    const collection1 = new PointCloudDMVolumeCollection(volumeInstanceRef2);

    dmModel.assignStyledObjectCollection(collection0, { color: color0 });
    dmModel.assignStyledObjectCollection(collection1, { color: color1 });

    expect(dmModel.styledCollections).toHaveLength(2);

    dmModel.unassignStyledObjectCollection(collection0);

    expect(dmModel.styledCollections).toHaveLength(1);
    const expectedRefs = Array.from(
      (dmModel.styledCollections[0].objectCollection as PointCloudDMVolumeCollection).getDataModelInstanceRefs()
    );
    expect(expectedRefs).toEqual(volumeInstanceRef2);
  });

  test('setModelTransform() changes custom transform, not source transform', () => {
    const originalCustomTransform = classicModel.getModelTransformation();
    const originalSourceTransform = classicModel.getCdfToDefaultModelTransformation();

    const modifyingTransform = new Matrix4().setPosition(1, 2, 3);

    classicModel.setModelTransformation(modifyingTransform);

    const newTransform = classicModel.getModelTransformation();

    expect(originalCustomTransform).not.toEqual(newTransform);
    expect(newTransform).toEqual(modifyingTransform);

    expect(classicModel.getCdfToDefaultModelTransformation()).toEqual(originalSourceTransform);
  });

  test('visible property hides or unhides model', () => {
    const visible = true;
    expect(classicModel.visible).toBeTrue();

    classicModel.visible = false;

    expect(classicModel.visible).not.toBe(visible);
    expect(classicModel.visible).not.toBe(visible);

    classicModel.visible = true;

    expect(classicModel.visible).toBe(visible);
    expect(classicModel.visible).toBe(visible);
  });
});
