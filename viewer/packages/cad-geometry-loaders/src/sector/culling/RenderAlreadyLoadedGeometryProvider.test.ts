/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { createGlContext } from '../../../../../test-utilities';
import { CadMaterialManager, CadGeometryRenderModePipelineProvider, RenderMode } from '@reveal/rendering';

import { RenderAlreadyLoadedGeometryProvider } from './RenderAlreadyLoadedGeometryProvider';
import { SceneHandler } from '@reveal/utilities';

describe('RenderAlreadyLoadedGeometryProvider', () => {
  let depthRenderPipelineProvider: CadGeometryRenderModePipelineProvider;
  let materialManager: CadMaterialManager;
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });
  let target: THREE.WebGLRenderTarget;

  beforeEach(() => {
    const sceneHandler = new SceneHandler();
    materialManager = new CadMaterialManager();
    depthRenderPipelineProvider = new CadGeometryRenderModePipelineProvider(
      RenderMode.DepthBufferOnly,
      materialManager,
      sceneHandler
    );

    const size = renderer.getSize(new THREE.Vector2());
    target = new THREE.WebGLRenderTarget(size.width, size.height);
  });

  test('renderOccludingGeometry() renders depth', () => {
    const renderDetailedToDepthOnlySpy = jest.spyOn(depthRenderPipelineProvider, 'pipeline');
    const provider = new RenderAlreadyLoadedGeometryProvider(renderer, depthRenderPipelineProvider);
    provider.renderOccludingGeometry(target, new THREE.PerspectiveCamera());

    expect(renderDetailedToDepthOnlySpy).toBeCalledTimes(1);
  });
});
