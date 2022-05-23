/*!
 * Copyright 2021 Cognite AS
 */

import { THREE } from '@cognite/reveal';
import CameraControls from 'camera-controls';
import { getParamsFromURL, createSDKFromEnvironment } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import * as reveal from '@cognite/reveal/internals';
import React, { useEffect, useRef, useState } from 'react';
import { CanvasWrapper, Loader } from '../components/styled';
import { resizeRendererToDisplaySize } from '../utils/sceneHelpers';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';

import { createManagerAndLoadModel } from '../utils/createManagerAndLoadModel';
import { suggestCameraConfig } from '../utils/cameraConfig';

CameraControls.install({ THREE });

export function Simple() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<reveal.utilities.LoadingState>({ isLoading: false, itemsLoaded: 0, itemsRequested: 0, itemsCulled: 0 });

  useEffect(() => {
    let revealManager: reveal.RevealManager;
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    async function main() {
      if (!canvas.current) {
        return;
      }
      const { project, modelUrl, modelRevision, environmentParam } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });

      let client;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.simple', project, environmentParam);
      } else {
        client = new CogniteClient({ appId: 'reveal.example.simple',
                                     project: 'dummy',
                                     getToken: async () => 'dummy' });
      }

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
      });

      renderer.localClippingEnabled = true;
      renderer.setClearColor('#444');
      renderer.setPixelRatio(window.devicePixelRatio);

      const sceneHandler = new reveal.SceneHandler();
      const { revealManager, model } = await createManagerAndLoadModel(client, renderer, sceneHandler, 'cad', modelRevision, modelUrl);
      sceneHandler.addCadModel(model, model.cadModelIdentifier)
      revealManager.on('loadingStateChanged', setLoadingState);

      const { position, target, near, far } = suggestCameraConfig(model.cadModelMetadata.scene.root,
                                                                  model.getModelTransformation());
      const camera = new THREE.PerspectiveCamera(75, 2, near, far);
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

      (window as any).sceneHandler = sceneHandler;
      (window as any).THREE = THREE;
      (window as any).camera = camera;
      (window as any).controls = controls;
      (window as any).renderer = renderer;
    }

    main();

    return () => {
      revealManager?.dispose();
      animationLoopHandler.dispose();
    };
  }, []);
  const { isLoading, itemsLoaded, itemsRequested } = loadingState;
  return (
    <CanvasWrapper>
      <Loader isLoading={isLoading} style={{ position: 'absolute' }}>
        Downloading {itemsLoaded} / {itemsRequested} sectors.
      </Loader>
      <canvas ref={canvas} />
    </CanvasWrapper>
  );
}
