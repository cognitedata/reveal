/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import * as THREE from 'three';

import CameraControls from 'camera-controls';
import { getParamsFromURL } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import * as reveal from '@cognite/reveal/experimental';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';

CameraControls.install({ THREE });

function getModel2Params() {
  return getParamsFromURL({
    project: 'publicdata',
    modelUrl: 'primitives'
  }, {
    modelId: 'modelId2',
    revisionId: 'revisionId2',
    modelUrl: 'modelUrl2'
  });
}

export function TwoModels() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    let revealManager: reveal.RevealManager<unknown>;
    async function main() {
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const { modelUrl: modelUrl2, modelRevision: modelRevision2 } = getModel2Params();
      const client = new CogniteClient({ appId: 'reveal.example.two-models' });
      client.loginWithOAuth({ project });

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#444');
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();

      let model: reveal.CadNode;
      if(modelRevision) {
        revealManager = reveal.createCdfRevealManager(client);
        model = await revealManager.addModel('cad', modelRevision);
      } else if(modelUrl) {
        revealManager = reveal.createLocalRevealManager();
        model = await revealManager.addModel('cad', modelUrl);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }
      scene.add(model);
      let model2: reveal.CadNode;
      if(modelRevision2) {
        model2 = await revealManager.addModel('cad', modelRevision2);
      } else if(modelUrl2) {
        revealManager = reveal.createLocalRevealManager();
        model2 = await revealManager.addModel('cad', modelUrl2);
      } else {
        throw new Error(
          'Need to provide either project & model2 OR modelUrl2 as query parameters'
        );
      }
      scene.add(model2);

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

      const model2Offset = new THREE.Group();
      model2Offset.position.set(-2, -2, 0);
      model2Offset.add(model2);
      scene.add(model);
      scene.add(model2Offset);

      revealManager.update(camera);

      animationLoopHandler.setOnAnimationFrameListener((deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }
        const needsUpdate = controlsNeedUpdate || revealManager.needsRedraw;

        if (needsUpdate) {
          renderer.render(scene, camera);
          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();

      (window as any).scene = scene;
      (window as any).THREE = THREE;
      (window as any).camera = camera;
      (window as any).controls = controls;
    }

    main();
    return () => {
      animationLoopHandler.dispose();
      revealManager.dispose();
    }
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
