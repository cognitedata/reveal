/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { EffectRenderManager } from '@/datamodels/cad/rendering/EffectRenderManager';
import { RenderMode } from '@/datamodels/cad/rendering/RenderMode';

describe('EffectRenderManager', () => {
  const materialManager = new MaterialManager();
  const context: WebGLRenderingContext = require('gl')(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });
  const camera = new THREE.PerspectiveCamera();
  const scene = new THREE.Scene();

  test('construct', () => {
    expect(() => new EffectRenderManager(materialManager)).not.toThrow();
  });

  test('addPostRenderEffects reset settings after completed', () => {
    // Arrange
    const target = new THREE.WebGLRenderTarget(64, 64);
    renderer.setRenderTarget(target);
    renderer.setClearAlpha(0.77);
    materialManager.setRenderMode(RenderMode.PackColorAndNormal);

    const effectManager = new EffectRenderManager(materialManager);

    // Act
    effectManager.addPostRenderEffects(renderer, camera, scene);

    // Assert
    expect(renderer.getRenderTarget()).toBe(target);
    expect(renderer.getClearAlpha()).toBe(0.77);
    expect(materialManager.getRenderMode()).toBe(RenderMode.PackColorAndNormal);
  });
});
