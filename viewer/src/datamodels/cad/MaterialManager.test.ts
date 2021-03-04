/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { range } from 'lodash';
import { IndexSet } from '../../utilities/IndexSet';
import { MaterialManager } from './MaterialManager';
import { RenderMode } from './rendering/RenderMode';
import { FixedNodeSet } from './styling';
import { NumericRange } from '../../utilities';

describe('MaterialManager', () => {
  let manager: MaterialManager;

  beforeEach(() => {
    manager = new MaterialManager();
  });

  test('addModelMaterials creates material and initializes collections for model', () => {
    manager.addModelMaterials('model', 16);
    expect(manager.getModelMaterials('model')).not.toBeEmpty();
    expect(manager.getModelBackTreeIndices('model')).toEqual(new IndexSet(range(0, 17)));
    expect(manager.getModelGhostedTreeIndices('model')).toEqual(new IndexSet());
    expect(manager.getModelInFrontTreeIndices('model')).toEqual(new IndexSet());
  });

  test('set clipping planes, materials are updated', () => {
    manager.addModelMaterials('model', 16);
    const materialsChangedListener = jest.fn();
    manager.on('materialsChanged', materialsChangedListener);

    manager.clippingPlanes = [new THREE.Plane()];
    expect(materialsChangedListener).toBeCalledTimes(1);
  });

  test('set clip intersections, materials are updated', () => {
    manager.addModelMaterials('model', 16);
    const materialsChangedListener = jest.fn();
    manager.on('materialsChanged', materialsChangedListener);

    manager.clipIntersection = !manager.clipIntersection;
    expect(materialsChangedListener).toBeCalledTimes(1);
  });

  test('set render mode, materials are updated', () => {
    manager.addModelMaterials('model', 16);
    const materialsChangedListener = jest.fn();
    manager.on('materialsChanged', materialsChangedListener);

    manager.setRenderMode(RenderMode.TreeIndex);
    expect(materialsChangedListener).toBeCalledTimes(1);
  });

  test('setModelDefaultNodeAppearance, node sets are updated', () => {
    manager.addModelMaterials('model', 4);

    manager.setModelDefaultNodeAppearance('model', { renderGhosted: true });

    expect(manager.getModelBackTreeIndices('model')).toEqual(new IndexSet());
    expect(manager.getModelGhostedTreeIndices('model')).toEqual(new IndexSet([0, 1, 2, 3, 4]));
  });

  test('style provider triggers update, node sets are updated', () => {
    manager.addModelMaterials('model', 4);
    const provider = manager.getModelNodeAppearanceProvider('model');
    const listener = jest.fn();
    manager.on('materialsChanged', listener);

    provider.addStyledSet(new FixedNodeSet(new IndexSet([1, 2, 3])), { renderGhosted: true });

    expect(manager.getModelBackTreeIndices('model')).toEqual(new IndexSet([0, 4]));
    expect(manager.getModelGhostedTreeIndices('model')).toEqual(new IndexSet([1, 2, 3]));
    expect(listener).toBeCalled();
  });

  test('transform provider triggers update, triggers materialChanged', () => {
    manager.addModelMaterials('model', 4);
    const listener = jest.fn();
    manager.on('materialsChanged', listener);
    const provider = manager.getModelNodeTransformProvider('model');

    provider.setNodeTransform(new NumericRange(0, 2), new THREE.Matrix4().makeRotationY(Math.PI / 4.0));

    expect(listener).toBeCalled();
  });
});
