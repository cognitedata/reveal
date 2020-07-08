/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal/experimental';
import dat from 'dat.gui';
import {
  getParamsFromURL,
  createRenderManager,
} from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';

CameraControls.install({ THREE });

export function SSAO() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const gui = new dat.GUI();
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();

    async function main() {
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const client = new CogniteClient({ appId: 'reveal.example.ssao' });
      client.loginWithOAuth({ project });

      const scene = new THREE.Scene();
      const revealManager: reveal.RenderManager = createRenderManager(
        modelRevision !== undefined ? 'cdf' : 'local',
        client
      );

      let model: reveal.CadNode;
      if (
        revealManager instanceof reveal.LocalHostRevealManager &&
        modelUrl !== undefined
      ) {
        model = await revealManager.addModel('cad', modelUrl);
      } else if (
        revealManager instanceof reveal.RevealManager &&
        modelRevision !== undefined
      ) {
        model = await revealManager.addModel('cad', modelRevision);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }
      scene.add(model);

      const effect = new reveal.SsaoEffect();
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#444');
      renderer.setSize(window.innerWidth, window.innerHeight);

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

      let effectNeedsUpdate = false;
      const updateEffect = () => {
        effectNeedsUpdate = true;
      };

      const renderSettings = {
        pass: reveal.SsaoPassType.Antialias,
      };

      gui
        .add(renderSettings, 'pass', {
          Regular: reveal.SsaoPassType.Regular,
          Ssao: reveal.SsaoPassType.Ssao,
          SsaoFinal: reveal.SsaoPassType.SsaoFinal,
          Antialias: reveal.SsaoPassType.Antialias,
        })
        .onChange(updateEffect);

      gui.add(effect, 'kernelRadius').min(0.1).max(30.0).onChange(updateEffect);

      gui.add(effect, 'minDistance').min(0.0).max(0.001).onChange(updateEffect);

      gui.add(effect, 'maxDistance').min(0.0).max(0.2).onChange(updateEffect);

      animationLoopHandler.setOnAnimationFrameListener((deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (
          controlsNeedUpdate ||
          revealManager.needsRedraw ||
          effectNeedsUpdate
        ) {
          effect.render(renderer, scene, camera, renderSettings.pass);
          effectNeedsUpdate = false;
          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();
    }

    main();

    return () => {
      gui.destroy();
      animationLoopHandler.dispose();
    };
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
