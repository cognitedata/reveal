/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { PointCloudMaterialManager } from './PointCloudMaterialManager';

describe('PointCloudMaterialManager', () => {
  let materialManager: PointCloudMaterialManager;

  beforeEach(() => {
    materialManager = new PointCloudMaterialManager();
  });

  test('addModelMaterial creates material and sets corresponding value in the map', () => {
    const modelIdentifier = Symbol('model');
    materialManager.addModelMaterial(modelIdentifier);

    expect(materialManager.getModelMaterial(modelIdentifier)).not.toBeEmpty();
  });

  test('removeModelMaterial removes material from the map', () => {
    const modelIdentifier = Symbol('model');
    materialManager.addModelMaterial(modelIdentifier);

    expect(materialManager.getModelMaterial(modelIdentifier)).not.toBeEmpty();

    materialManager.removeModelMaterial(modelIdentifier);

    expect(() => materialManager.getModelMaterial(modelIdentifier)).toThrow();
  });

  test('setModelsMaterialParameters sets material parameters for all models', () => {
    const modelIdentifier1 = Symbol('model');
    const modelIdentifier2 = Symbol('model');
    materialManager.addModelMaterial(modelIdentifier1);
    materialManager.addModelMaterial(modelIdentifier2);

    const material1 = materialManager.getModelMaterial(modelIdentifier1);
    const material2 = materialManager.getModelMaterial(modelIdentifier2);

    const materialParameters = { weighted: true, blending: THREE.AdditiveBlending };
    materialManager.setModelsMaterialParameters(materialParameters);

    expect(material1.weighted).toBe(materialParameters.weighted);
    expect(material2.weighted).toBe(materialParameters.weighted);

    expect(material1.blending).toBe(materialParameters.blending);
    expect(material2.blending).toBe(materialParameters.blending);
  });
});
