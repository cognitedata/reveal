/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import { THREE } from '@cognite/reveal';

import CameraControls from 'camera-controls';
import { createSDKFromEnvironment, getParamsFromURL } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import * as reveal from '@cognite/reveal/internals';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { createManagerAndLoadModel } from '../utils/createManagerAndLoadModel';
import { suggestCameraConfig } from '../utils/cameraConfig';

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
    let revealManager: reveal.RevealManager;
    async function main() {
      const { project, modelUrl, modelRevision, environmentParam } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const { modelUrl: modelUrl2, modelRevision: modelRevision2 } = getModel2Params();

      let client;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.twomodels', project, environmentParam);
      } else {
        client = new CogniteClient({ appId: 'reveal.example.twomodels',
                                     project: 'dummy',
                                     getToken: async () => 'dummy' });
      }

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#444');
      renderer.setSize(window.innerWidth, window.innerHeight);

      const sceneHandler = new reveal.SceneHandler();

      const { revealManager, model } = await createManagerAndLoadModel(client, renderer, sceneHandler, 'cad', modelRevision, modelUrl);
      sceneHandler.addCadModel(model, model.cadModelIdentifier);

      let model2: reveal.CadNode;
      if (modelRevision2) {
        const modelIdentifier = new reveal.CdfModelIdentifier(modelRevision2.modelId, modelRevision2.revisionId);
        model2 = await revealManager.addModel('cad', modelIdentifier);
      } else if (modelUrl2) {
        const modelIdentifier = new reveal.LocalModelIdentifier(modelUrl2.fileName!);
        model2 = await revealManager.addModel('cad', modelIdentifier);
      } else {
        throw new Error(
          'Need to provide either project & modelId2/revisionId2 OR modelUrl2 as query parameters'
        );
      }      
      sceneHandler.addCadModel(model2, model2.cadModelIdentifier);

      const { position, target, near, far } = suggestCameraConfig(model.cadModelMetadata.scene.root,
                                                                  model.getModelTransformation());
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
      sceneHandler.addCadModel(model, model.cadModelIdentifier);
      sceneHandler.addCadModel(model2Offset, model2.cadModelIdentifier);

      revealManager.update(camera);

      animationLoopHandler.setOnAnimationFrameListener((deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }
        const needsUpdate = controlsNeedUpdate || revealManager.needsRedraw;

        if (needsUpdate) {
          revealManager.render(camera);
          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();

      (window as any).sceneHandler = sceneHandler;
      (window as any).THREE = THREE;
      (window as any).camera = camera;
      (window as any).controls = controls;
    }

    main();
    return () => {
      animationLoopHandler.dispose();
      revealManager?.dispose();
    }
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
