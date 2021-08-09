/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import range from 'lodash/range';
import { IndexSet } from '../../utilities/IndexSet';
import { RenderMode } from './rendering/RenderMode';
import { TreeIndexNodeCollection } from './styling';
import { NumericRange } from '../../utilities';
import { CadMaterialManager } from './CadMaterialManager';
import { Materials } from './rendering/materials';
import { cloneDeep } from 'lodash';

describe('CadMaterialManager', () => {
  let manager: CadMaterialManager;

  beforeEach(() => {
    manager = new CadMaterialManager();
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

  test('set render mode, materials are updated', () => {
    manager.addModelMaterials('model', 16);
    const initialRenderMode = cloneDeep(manager.getModelMaterials('model').box.uniforms['renderMode']);

    manager.setRenderMode(RenderMode.TreeIndex);
    expect(manager.getModelMaterials('model').box.uniforms['renderMode']).not.toEqual(initialRenderMode);
  });

  test('setModelDefaultNodeAppearance, node collection are updated', () => {
    manager.addModelMaterials('model', 4);

    manager.setModelDefaultNodeAppearance('model', { renderGhosted: true });

    expect(manager.getModelBackTreeIndices('model')).toEqual(new IndexSet());
    expect(manager.getModelGhostedTreeIndices('model')).toEqual(new IndexSet([0, 1, 2, 3, 4]));
  });

  test('style provider triggers update, node collections are updated', () => {
    manager.addModelMaterials('model', 4);
    const provider = manager.getModelNodeAppearanceProvider('model');
    const listener = jest.fn();
    manager.on('materialsChanged', listener);

    provider.assignStyledNodeCollection(new TreeIndexNodeCollection(new IndexSet([1, 2, 3])), { renderGhosted: true });

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

  test('per-model clipping planes are combined with global clipping planes', () => {
    // Arrange
    const globalClipPlanes = [new THREE.Plane(), new THREE.Plane()];
    manager.clippingPlanes = globalClipPlanes;
    manager.addModelMaterials('1', 16);
    manager.addModelMaterials('2', 16);

    // Act
    manager.setModelClippingPlanes('1', [new THREE.Plane(), new THREE.Plane()]);
    manager.setModelClippingPlanes('2', [new THREE.Plane()]);

    // Assert
    for (const material of iterateMaterials(manager.getModelMaterials('1'))) {
      expect(material.clipIntersection).toBeFalse();
      expect(material.clipping).toBeTrue();
      expect(material.clippingPlanes.length).toBe(4);
    }
    for (const material of iterateMaterials(manager.getModelMaterials('2'))) {
      expect(material.clipIntersection).toBeFalse();
      expect(material.clipping).toBeTrue();
      expect(material.clippingPlanes.length).toBe(3);
    }
  });
});

function* iterateMaterials(materials: Materials): Generator<THREE.ShaderMaterial> {
  return Object.values(materials).map(x => x as THREE.ShaderMaterial);
}
