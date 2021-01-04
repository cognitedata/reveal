/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { getParamsFromURL } from '../../../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import * as reveal from '@cognite/reveal/experimental';
import React, { useEffect, useRef, useState } from 'react';
import { CanvasWrapper } from '../../../components/styled';
import { AnimationLoopHandler } from '../../../utils/AnimationLoopHandler';
import { resizeRendererToDisplaySize } from '../../../utils/sceneHelpers';

CameraControls.install({ THREE });

export function NodeTransformTestPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<
    reveal.utilities.LoadingState
  >({
    isLoading: true,
    itemsLoaded: 0,
    itemsRequested: 0,
  });

  useEffect(() => {
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    let revealManager: reveal.RevealManager<unknown>;

    async function main() {
      if (!canvas.current) {
        return;
      }
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const client = new CogniteClient({ appId: 'reveal.example.testable' });
      client.loginWithOAuth({ project });

      const scene = new THREE.Scene();

      const transformedNodes: Map<number, THREE.Matrix4> = new Map();

      const nodeAppearanceProvider: reveal.NodeAppearanceProvider = {
        styleNode(treeIndex: number) {
          let style = reveal.DefaultNodeAppearance.NoOverrides;
          if (transformedNodes.has(treeIndex)) {
            return { worldTransform: transformedNodes.get(treeIndex)! };
          }
/*           if (pickedNodes.has(treeIndex)) {
            style = { ...style, ...reveal.DefaultNodeAppearance.Highlighted };
          }
          if (ghostedNodes.has(treeIndex)) {
            style = { ...style, ...reveal.DefaultNodeAppearance.Ghosted };
          }*/
          return style;
        },
      };

      let model: reveal.CadNode;
      if (modelRevision) {
        revealManager = reveal.createCdfRevealManager(client, {
          logMetrics: false,
        });
        model = await revealManager.addModel(
          'cad',
          modelRevision,
          nodeAppearanceProvider
        );
      } else if (modelUrl) {
        revealManager = reveal.createLocalRevealManager({ logMetrics: false });
        model = await revealManager.addModel(
          'cad',
          modelUrl,
          nodeAppearanceProvider
        );
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      let skipFirstLoadingState = true;
      revealManager.on('loadingStateChanged', (loadingState) => {
        if (skipFirstLoadingState) {
          skipFirstLoadingState = false;
          if (loadingState.isLoading) {
            setLoadingState(loadingState);
          }
        } else {
          setLoadingState(loadingState);
        }
      });

      scene.add(model);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
      });
      renderer.setClearColor('#444');
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.localClippingEnabled = true;

      let { position, target, near, far } = model.suggestCameraConfig();
      let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
        75,
        2,
        near,
        far
      );

      // ------------------------------------------------------
      // UNIQUE CONTENT END
      // ------------------------------------------------------

      const transformedTreeIndexes = [...Array(80).keys()].filter(
        (p) => p % 2 === 0
      );
      transformedTreeIndexes.forEach((p) => {
        const transform = new THREE.Matrix4();
        transform.makeRotationFromEuler(
          new THREE.Euler(Math.PI / 2, Math.PI / 2, -Math.PI)
        );
        transform.setPosition(new THREE.Vector3(5, 6, 7));
        transformedNodes.set(p, transform);
      });
      model.requestNodeUpdate(transformedTreeIndexes);

      // ------------------------------------------------------
      // UNIQUE CONTENT END
      // ------------------------------------------------------

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
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();

      camera.updateMatrixWorld();
      revealManager.update(camera);

      animationLoopHandler.setOnAnimationFrameListener(async (deltaTime) => {
        let needsResize = resizeRendererToDisplaySize(renderer, camera);

        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (controlsNeedUpdate || revealManager.needsRedraw || needsResize) {
          revealManager.render(renderer, camera, scene);

          // onRendered.forEach((element) => {
          //   element();
          // });

          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();

      (window as any).scene = scene;
      (window as any).THREE = THREE;
      (window as any).camera = camera;
      (window as any).controls = controls;
      (window as any).renderer = renderer;
    }

    main();

    return () => {
      revealManager?.dispose();
      animationLoopHandler.dispose();
      revealManager?.dispose();
    };
  }, []);

  const readyForScreenshot = !loadingState.isLoading;

  return (
    <>
      <CanvasWrapper>
        <canvas ref={canvas} />
      </CanvasWrapper>
      {readyForScreenshot && <div id="ready">Ready</div>}
    </>
  );
}
