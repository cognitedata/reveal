/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal/experimental';
import dat from 'dat.gui';
import { getParamsFromURL } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { defaultRenderOptions } from '@cognite/reveal';
import { resizeRendererToDisplaySize } from '../utils/sceneHelpers';

CameraControls.install({ THREE });

export function SSAO() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const gui = new dat.GUI();
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    let revealManager: reveal.RevealManager<unknown>;

    async function main() {
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const client = new CogniteClient({ appId: 'reveal.example.ssao' });
      client.loginWithOAuth({ project });

      const scene = new THREE.Scene();

      const nodeAppearanceProvider: reveal.NodeAppearanceProvider = {
        styleNode(_: number) {
          return reveal.DefaultNodeAppearance.NoOverrides;
        }
      };

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#444');
      renderer.setSize(window.innerWidth, window.innerHeight);

      let model: reveal.CadNode;
      if (modelRevision) {
        revealManager = reveal.createCdfRevealManager(client, renderer, scene, { logMetrics: false });
        model = await revealManager.addModel('cad', modelRevision, nodeAppearanceProvider);
      } else if (modelUrl) {
        revealManager = reveal.createLocalRevealManager(renderer, scene, { logMetrics: false });
        model = await revealManager.addModel('cad', modelUrl, nodeAppearanceProvider);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      scene.add(model);

      const { position, target, near, far } = model.suggestCameraConfig();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        near,
        far
      );
      const controls = new CameraControls(camera, renderer.domElement);
      controls.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z
      );
      controls.update(0.0);
      camera.updateMatrixWorld();
      revealManager.update(camera);

      const renderOptions = defaultRenderOptions;
      
      const updateEffect = () => {
        revealManager.renderOptions = renderOptions;
      };

      gui.add(renderOptions.ssaoRenderParameters, 'sampleRadius').min(0.0).max(30.0).onChange(updateEffect);

      gui.add(renderOptions.ssaoRenderParameters, 'sampleSize').min(1).max(256).step(1).onChange(updateEffect);

      gui.add(renderOptions.ssaoRenderParameters, 'depthCheckBias').min(0.0).max(1.0).onChange(updateEffect);

      animationLoopHandler.setOnAnimationFrameListener(async (deltaTime: number) => {
        let needsResize = resizeRendererToDisplaySize(renderer, camera);
        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (controlsNeedUpdate || revealManager.needsRedraw || needsResize) {
          revealManager.render(camera);
          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();
    }

    main();

    return () => {
      gui.destroy();
      animationLoopHandler.dispose();
      revealManager?.dispose();
    };
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
