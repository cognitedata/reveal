/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { RenderMode } from './RenderMode';

import { RenderOptions } from '../rendering/types';
import { createGlContext } from '../../../../test-utilities';

import { CadMaterialManager } from '../CadMaterialManager';
import { EffectRenderManager } from './EffectRenderManager';

// type Mutable<T> = { -readonly [P in keyof T]: T[P] };

describe('EffectRenderManager', () => {
  const materialManager = new CadMaterialManager();
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  // Emulate WebGL2
  (context as WebGL2RenderingContext).createVertexArray = jest.fn();
  (context as WebGL2RenderingContext).bindVertexArray = jest.fn();
  const renderer = new THREE.WebGLRenderer({ context });
  const camera = new THREE.PerspectiveCamera();
  const scene = new THREE.Scene();
  const options: RenderOptions = {};

  test('construct', () => {
    expect(() => new EffectRenderManager(renderer, scene, materialManager, options)).not.toThrow();
  });

  test('render() resets settings after completed', () => {
    // Arrange
    const target = new THREE.WebGLRenderTarget(64, 64);
    renderer.setRenderTarget(target);
    renderer.setClearAlpha(0.77);
    materialManager.setRenderMode(RenderMode.PackColorAndNormal);

    const effectManager = new EffectRenderManager(renderer, scene, materialManager, options);

    // Act
    effectManager.render(camera);

    // Assert
    expect(renderer.getRenderTarget()).toBe(target);
    expect(renderer.getClearAlpha()).toBe(0.77);
    expect(materialManager.getRenderMode()).toBe(RenderMode.PackColorAndNormal);
  });

  test('sets up multisample for WebGL 2', () => {
    // Arrange
    const webglRenderer = new THREE.WebGLRenderer({ context });
    const options: RenderOptions = {
      multiSampleCountHint: 4
    };
    const effectManager = new EffectRenderManager(webglRenderer, scene, materialManager, options);
    const setRenderTargetSpy = jest.spyOn(webglRenderer, 'setRenderTarget');

    // Act
    effectManager.render(camera);

    // Assert
    expect(setRenderTargetSpy).toBeCalled();
    const callWithMultiTarget = setRenderTargetSpy.mock.calls.find(
      x => x[0] instanceof THREE.WebGLMultisampleRenderTarget
    );

    expect(callWithMultiTarget).toBeDefined();
  });
});
