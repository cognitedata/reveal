/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { range } from 'lodash';
import { IndexSet } from '../../utilities/IndexSet';
import { MaterialManager } from './MaterialManager';
import { RenderMode } from './rendering/RenderMode';
import { FixedNodeSet } from './styling';

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

  test('setModelDefaultNodeAppearance, materials are updated', () => {
    manager.addModelMaterials('model', 4);
    const materialsChangedListener = jest.fn();
    manager.on('materialsChanged', materialsChangedListener);

    manager.setModelDefaultNodeAppearance('model', { renderGhosted: true });
    expect(materialsChangedListener).toBeCalledTimes(1);

    expect(manager.getModelBackTreeIndices('model')).toEqual(new IndexSet());
    expect(manager.getModelGhostedTreeIndices('model')).toEqual(new IndexSet([0, 1, 2, 3, 4]));
  });

  test('style provider triggers update, materials are updated', () => {
    manager.addModelMaterials('model', 4);
    const provider = manager.getModelNodeAppearanceProvider('model');

    const materialsChangedListener = jest.fn();
    manager.on('materialsChanged', materialsChangedListener);

    provider.addStyledSet(new FixedNodeSet(new IndexSet([1, 2, 3])), { renderGhosted: true });

    expect(materialsChangedListener).toBeCalledTimes(1);

    expect(manager.getModelBackTreeIndices('model')).toEqual(new IndexSet([0, 4]));
    expect(manager.getModelGhostedTreeIndices('model')).toEqual(new IndexSet([1, 2, 3]));
  });
});
