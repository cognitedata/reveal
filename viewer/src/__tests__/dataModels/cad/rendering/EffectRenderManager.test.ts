/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { RenderOptions } from '../../../..';

import { MaterialManager } from '../../../../datamodels/cad/MaterialManager';
import { EffectRenderManager } from '../../../../datamodels/cad/rendering/EffectRenderManager';
import { RenderMode } from '../../../../datamodels/cad/rendering/RenderMode';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

describe('EffectRenderManager', () => {
  const materialManager = new MaterialManager();
  const context: WebGLRenderingContext = require('gl')(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });
  const camera = new THREE.PerspectiveCamera();
  const scene = new THREE.Scene();
  const options: RenderOptions = {};

  test('construct', () => {
    expect(() => new EffectRenderManager(materialManager, options)).not.toThrow();
  });

  test('render() resets settings after completed', () => {
    // Arrange
    const target = new THREE.WebGLRenderTarget(64, 64);
    renderer.setRenderTarget(target);
    renderer.setClearAlpha(0.77);
    materialManager.setRenderMode(RenderMode.PackColorAndNormal);

    const effectManager = new EffectRenderManager(materialManager, options);

    // Act
    effectManager.render(renderer, camera, scene);

    // Assert
    expect(renderer.getRenderTarget()).toBe(target);
    expect(renderer.getClearAlpha()).toBe(0.77);
    expect(materialManager.getRenderMode()).toBe(RenderMode.PackColorAndNormal);
  });

  test('ignores multisample for WebGL 1', () => {
    // Arrange
    const options: RenderOptions = {
      multiSampleCountHint: 4
    };
    const webgl1Renderer = new THREE.WebGL1Renderer({ context });
    const effectManager = new EffectRenderManager(materialManager, options);
    const setRenderTargetSpy = jest.spyOn(webgl1Renderer, 'setRenderTarget');

    // Act
    effectManager.render(webgl1Renderer, camera, scene);

    // Assert
    expect(setRenderTargetSpy).toBeCalled();
    const callWithMultiTarget = setRenderTargetSpy.mock.calls.find(
      x => x[0] instanceof THREE.WebGLMultisampleRenderTarget
    );
    expect(callWithMultiTarget).toBeUndefined();
  });

  test('sets up multisample for WebGL 2', () => {
    // Arrange
    const webgl2Renderer = new THREE.WebGL1Renderer({ context });
    // Apply trickery to ditch readonly
    const mutableCapabilities: Mutable<THREE.WebGLCapabilities> = webgl2Renderer.capabilities;
    mutableCapabilities.isWebGL2 = true;
    expect(webgl2Renderer.capabilities.isWebGL2).toBeTrue(); // Pre-requisite

    const options: RenderOptions = {
      multiSampleCountHint: 4
    };
    const effectManager = new EffectRenderManager(materialManager, options);
    const setRenderTargetSpy = jest.spyOn(webgl2Renderer, 'setRenderTarget');

    // Act
    effectManager.render(webgl2Renderer, camera, scene);

    // Assert
    expect(setRenderTargetSpy).toBeCalled();
    const callWithMultiTarget = setRenderTargetSpy.mock.calls.find(
      x => x[0] instanceof THREE.WebGLMultisampleRenderTarget
    );
    expect(callWithMultiTarget).toBeDefined();
  });
});
