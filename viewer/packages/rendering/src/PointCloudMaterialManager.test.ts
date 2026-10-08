/*!
 * Copyright 2022 Cognite AS
 */

import { vi } from 'vitest';
import { AdditiveBlending } from 'three';
import type { PointCloudObjectIdMaps } from './pointcloud-rendering/PointCloudObjectIdMaps';
import { PointCloudObjectAppearanceTexture } from './pointcloud-rendering';
import { PointCloudMaterialManager } from './PointCloudMaterialManager';

describe('PointCloudMaterialManager', () => {
  let materialManager: PointCloudMaterialManager;
  let objectData: PointCloudObjectIdMaps;

  beforeEach(() => {
    materialManager = new PointCloudMaterialManager();
    objectData = { objectToAnnotationIds: new Map<number, number>(), annotationToObjectIds: new Map<number, number>() };
  });

  test('addModelMaterial creates material and sets corresponding value in the map', () => {
    const modelIdentifier = Symbol('model');
    materialManager.addModelMaterial(modelIdentifier, objectData);

    expect(materialManager.getModelMaterial(modelIdentifier)).not.to.be.empty;
  });

  test('removeModelMaterial removes material from the map', () => {
    const modelIdentifier = Symbol('model');
    materialManager.addModelMaterial(modelIdentifier, objectData);

    expect(materialManager.getModelMaterial(modelIdentifier)).not.to.be.empty;

    materialManager.removeModelMaterial(modelIdentifier);

    expect(() => materialManager.getModelMaterial(modelIdentifier)).toThrow();
  });

  test('setModelsMaterialParameters sets material parameters for all models', () => {
    const modelIdentifier1 = Symbol('model');
    const modelIdentifier2 = Symbol('model');

    materialManager.addModelMaterial(modelIdentifier1, objectData);
    materialManager.addModelMaterial(modelIdentifier2, objectData);

    const material1 = materialManager.getModelMaterial(modelIdentifier1);
    const material2 = materialManager.getModelMaterial(modelIdentifier2);

    const materialParameters = { weighted: true, blending: AdditiveBlending };
    materialManager.setModelsMaterialParameters(materialParameters);

    expect(material1.weighted).toBe(materialParameters.weighted);
    expect(material2.weighted).toBe(materialParameters.weighted);

    expect(material1.blending).toBe(materialParameters.blending);
    expect(material2.blending).toBe(materialParameters.blending);
  });

  test('dispose releases an owned appearance texture and keeps a borrowed one', () => {
    const modelIdentifier = Symbol('model');
    materialManager.addModelMaterial(modelIdentifier, objectData);
    const material = materialManager.getModelMaterial(modelIdentifier);

    const owned = material.objectAppearanceTexture;
    const ownedDispose = vi.spyOn(owned, 'dispose');
    material.dispose();
    expect(ownedDispose).toHaveBeenCalledTimes(1);

    materialManager.addModelMaterial(modelIdentifier, objectData);
    const borrowingMaterial = materialManager.getModelMaterial(modelIdentifier);
    const replaced = borrowingMaterial.objectAppearanceTexture;
    const replacedDispose = vi.spyOn(replaced, 'dispose');
    const borrowed = new PointCloudObjectAppearanceTexture(4, 4);
    const borrowedDispose = vi.spyOn(borrowed, 'dispose');

    borrowingMaterial.objectAppearanceTexture = borrowed;

    expect(replacedDispose).toHaveBeenCalledTimes(1);
    borrowingMaterial.dispose();
    expect(borrowedDispose).not.toHaveBeenCalled();
    borrowed.dispose();
  });
});
