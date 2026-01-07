/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMaterialManager, createCadMaterial } from './CadMaterialManager';
import { Materials } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';

import { IndexSet, NumericRange } from '@reveal/utilities';
import { TreeIndexNodeCollection } from '@reveal/cad-styling';

import range from 'lodash/range';
import cloneDeep from 'lodash/cloneDeep';

import { jest } from '@jest/globals';
import { createCadNode } from '../../../test-utilities/src/createCadNode';

describe('CadMaterialManager', () => {
  let manager: CadMaterialManager;

  const modelIdentifier1 = Symbol('model1');
  const modelIdentifier2 = Symbol('model2');

  beforeEach(() => {
    jest.useFakeTimers();
    manager = new CadMaterialManager();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('addModelMaterials creates material and initializes collections for model', () => {
    manager.addModelMaterials(modelIdentifier1, createCadMaterial(16));
    expect(manager.getModelMaterials(modelIdentifier1)).not.toBeEmpty();
    expect(manager.getModelBackTreeIndices(modelIdentifier1)).toEqual(new IndexSet(range(0, 17)));
    expect(manager.getModelGhostedTreeIndices(modelIdentifier1)).toEqual(new IndexSet());
    expect(manager.getModelInFrontTreeIndices(modelIdentifier1)).toEqual(new IndexSet());
    expect(manager.getModelVisibleTreeIndices(modelIdentifier1)).toEqual(new IndexSet(range(0, 17)));
  });

  test('set clipping planes, materials are updated', () => {
    const cadMaterial = createCadMaterial(16);

    manager.addModelMaterials(modelIdentifier1, cadMaterial);
    manager.clippingPlanes = [new THREE.Plane()];

    expect(cadMaterial.materials.box.clippingPlanes).toEqual(manager.clippingPlanes);
  });

  test('set render mode, materials are updated', () => {
    manager.addModelMaterials(modelIdentifier1, createCadMaterial(16));
    const initialRenderMode = cloneDeep(manager.getModelMaterials(modelIdentifier1).box.uniforms['renderMode']);

    manager.setRenderMode(RenderMode.TreeIndex);
    expect(manager.getModelMaterials(modelIdentifier1).box.uniforms['renderMode']).not.toEqual(initialRenderMode);
  });

  test('setModelDefaultNodeAppearance, node collection are updated', () => {
    manager.addModelMaterials(modelIdentifier1, createCadMaterial(4));

    manager.setModelDefaultNodeAppearance(modelIdentifier1, { renderGhosted: true });

    expect(manager.getModelBackTreeIndices(modelIdentifier1)).toEqual(new IndexSet());
    expect(manager.getModelGhostedTreeIndices(modelIdentifier1)).toEqual(new IndexSet([0, 1, 2, 3, 4]));
  });

  test('style provider triggers update, node collections are updated', () => {
    const cadNode = createCadNode(undefined, undefined, undefined, 5); // Ensure that model has at least 5 tree indices
    manager.addModelMaterials(modelIdentifier1, cadNode.cadMaterial);
    const provider = manager.getModelNodeAppearanceProvider(modelIdentifier1);

    provider.assignStyledNodeCollection(new TreeIndexNodeCollection(new IndexSet([1, 2, 3])), { renderGhosted: true });
    provider.assignStyledNodeCollection(new TreeIndexNodeCollection(new IndexSet([5])), { visible: false });
    jest.runAllTimers();

    expect(manager.getModelBackTreeIndices(modelIdentifier1).toPlainSet()).toEqual(new IndexSet([0, 4]).toPlainSet());
    expect(manager.getModelGhostedTreeIndices(modelIdentifier1)).toEqual(new IndexSet([1, 2, 3]));
    expect(manager.getModelVisibleTreeIndices(modelIdentifier1)).toEqual(new IndexSet([0, 1, 2, 3, 4]));
  });

  test('transform provider triggers update, triggers materialChanged', () => {
    const modelIdentifier = Symbol('model');
    manager.addModelMaterials(modelIdentifier, createCadMaterial(4));
    const listener = jest.fn();
    const provider = manager.getModelNodeTransformProvider(modelIdentifier);
    provider.on('changed', listener);

    provider.setNodeTransform(new NumericRange(0, 2), new THREE.Matrix4().makeRotationY(Math.PI / 4.0));

    expect(listener).toHaveBeenCalled();
  });

  test('per-model clipping planes are combined with global clipping planes', () => {
    // Arrange

    const globalClipPlanes = [new THREE.Plane(), new THREE.Plane()];
    manager.clippingPlanes = globalClipPlanes;
    manager.addModelMaterials(modelIdentifier1, createCadMaterial(16));
    manager.addModelMaterials(modelIdentifier2, createCadMaterial(16));

    // Act
    manager.setModelClippingPlanes(modelIdentifier1, [new THREE.Plane(), new THREE.Plane()]);
    manager.setModelClippingPlanes(modelIdentifier2, [new THREE.Plane()]);

    // Assert
    for (const material of iterateMaterials(manager.getModelMaterials(modelIdentifier1))) {
      expect(material.clipIntersection).toBeFalse();
      expect(material.clipping).toBeTrue();
      expect(material.clippingPlanes?.length).toBe(4);
    }
    for (const material of iterateMaterials(manager.getModelMaterials(modelIdentifier2))) {
      expect(material.clipIntersection).toBeFalse();
      expect(material.clipping).toBeTrue();
      expect(material.clippingPlanes?.length).toBe(3);
    }
  });

  test('addTexturedMeshMaterial creates textured material successfully', () => {
    // Arrange
    manager.addModelMaterials(modelIdentifier1, createCadMaterial(16));
    const texture = new THREE.Texture();
    const sectorId = 123;
    // Act
    const texturedMaterial = manager.addTexturedMeshMaterial(modelIdentifier1, sectorId, texture);
    // Assert
    expect(texturedMaterial).toBeDefined();
    expect(texturedMaterial.uniforms.tDiffuse.value).toBe(texture);
    // The material should be marked for update (needsUpdate might not be enumerable/visible in tests)
    expect(texturedMaterial).toHaveProperty('needsUpdate');
    // Verify the material is stored in the textured materials collection
    const materials = manager.getModelMaterials(modelIdentifier1);
    expect(materials.texturedMaterials[`texturedMaterial_${sectorId}`]).toBe(texturedMaterial);
  });

  test('addTexturedMeshMaterial throws error when model identifier not found', () => {
    // Arrange
    const nonExistentModelId = Symbol('nonExistent');
    const texture = new THREE.Texture();
    const sectorId = 123;
    // Act & Assert
    expect(() => {
      manager.addTexturedMeshMaterial(nonExistentModelId, sectorId, texture);
    }).toThrow('Model identifier: Symbol(nonExistent) not found');
  });

  test('addTexturedMeshMaterial disposes existing textured material when replacing', () => {
    // Arrange
    manager.addModelMaterials(modelIdentifier1, createCadMaterial(16));
    const texture1 = new THREE.Texture();
    const texture2 = new THREE.Texture();
    const sectorId = 123;
    // Create first textured material
    const firstMaterial = manager.addTexturedMeshMaterial(modelIdentifier1, sectorId, texture1);
    const disposeSpy = jest.spyOn(firstMaterial, 'dispose');
    // Act - create second textured material with same sectorId
    const secondMaterial = manager.addTexturedMeshMaterial(modelIdentifier1, sectorId, texture2);
    // Assert
    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect(secondMaterial.uniforms.tDiffuse.value).toBe(texture2);
    // Verify the new material replaced the old one
    const materials = manager.getModelMaterials(modelIdentifier1);
    expect(materials.texturedMaterials[`texturedMaterial_${sectorId}`]).toBe(secondMaterial);
  });

  test('addTexturedMeshMaterial clones original triangle mesh material properties', () => {
    // Arrange
    manager.addModelMaterials(modelIdentifier1, createCadMaterial(16));
    const texture = new THREE.Texture();
    const sectorId = 123;

    const originalMaterial = manager.getModelMaterials(modelIdentifier1).triangleMesh;
    const originalUniforms = { ...originalMaterial.uniforms };
    // Act
    const texturedMaterial = manager.addTexturedMeshMaterial(modelIdentifier1, sectorId, texture);
    // Assert
    // Verify it's a clone, not the same instance
    expect(texturedMaterial).not.toBe(originalMaterial);
    // Verify certain uniforms are preserved from original (excluding the tDiffuse we set)
    Object.keys(originalUniforms).forEach(key => {
      if (key !== 'tDiffuse') {
        expect(texturedMaterial.uniforms[key]).toEqual(originalUniforms[key]);
      }
    });
  });
});

function* iterateMaterials(materials: Materials): Generator<THREE.RawShaderMaterial> {
  return Object.values(materials).map(x => x as THREE.RawShaderMaterial);
}
