/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { createGlContext } from '../../../../../test-utilities';
import { CadMaterialManager, EffectRenderManager } from '@reveal/rendering';

import { RenderAlreadyLoadedGeometryProvider } from './RenderAlreadyLoadedGeometryProvider';
import { CadSceneComponentsProvider } from '../../CadSceneComponentsProvider';

describe('RenderAlreadyLoadedGeometryProvider', () => {
  let renderManager: EffectRenderManager;
  let materialManager: CadMaterialManager;
  let scene: THREE.Scene;
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });
  let target: THREE.WebGLRenderTarget;

  beforeEach(() => {
    scene = new THREE.Scene();
    materialManager = new CadMaterialManager();
    renderManager = new EffectRenderManager(
      renderer,
      new CadSceneComponentsProvider(materialManager, scene),
      materialManager,
      {}
    );
    const size = renderer.getSize(new THREE.Vector2());
    target = new THREE.WebGLRenderTarget(size.width, size.height);
  });

  test('renderOccludingGeometry() restores render target and auto size after completion', () => {
    const original = {
      target: renderManager.getRenderTarget(),
      autoSize: renderManager.getRenderTargetAutoSize()
    };

    const provider = new RenderAlreadyLoadedGeometryProvider(renderManager);
    provider.renderOccludingGeometry(target, new THREE.PerspectiveCamera());

    expect(renderManager.getRenderTarget()).toEqual(original.target);
    expect(renderManager.getRenderTargetAutoSize()).toEqual(original.autoSize);
  });

  test('renderOccludingGeometry() renders depth', () => {
    const renderDetailedToDepthOnlySpy = jest.spyOn(renderManager, 'renderDetailedToDepthOnly');
    const provider = new RenderAlreadyLoadedGeometryProvider(renderManager);
    provider.renderOccludingGeometry(target, new THREE.PerspectiveCamera());

    expect(renderDetailedToDepthOnlySpy).toBeCalledTimes(1);
  });
});
