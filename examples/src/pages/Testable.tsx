/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { getParamsFromURL } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import * as reveal from '@cognite/reveal/experimental';
import React, { useEffect, useRef, useState } from 'react';
import { CanvasWrapper, Loader } from '../components/styled';
import { BoundingBoxClipper } from '@cognite/reveal';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { resizeRendererToDisplaySize } from '../utils/sceneHelpers';

CameraControls.install({ THREE });

export function Testable() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<reveal.utilities.LoadingState>({ isLoading: true, itemsLoaded: 0, itemsRequested: 0 });

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

      const pickedNodes: Set<number> = new Set();

      const nodeAppearanceProvider: reveal.NodeAppearanceProvider = {
        styleNode(treeIndex: number) {
          if (pickedNodes.has(treeIndex)) {
            return reveal.DefaultNodeAppearance.Highlighted;
          }
          return reveal.DefaultNodeAppearance.NoOverrides;
        }
      };

      let model: reveal.CadNode;
      if (modelRevision) {
        revealManager = reveal.createCdfRevealManager(client);
        model = await revealManager.addModel('cad', modelRevision, nodeAppearanceProvider);
      } else if (modelUrl) {
        revealManager = reveal.createLocalRevealManager();
        model = await revealManager.addModel('cad', modelUrl, nodeAppearanceProvider);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      let skipFirstLoadingState = true;
      revealManager.on('loadingStateChanged', (loadingState) => {
        if (skipFirstLoadingState) {
          skipFirstLoadingState = false;
          if(loadingState.isLoading) {
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
      let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, 2, near, far);;

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

      // Test presets
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      const test = searchParams.get('test');

      if (test === "default_camera") {
        camera = new THREE.PerspectiveCamera();
      } else if (test === "suggested_camera") {
        // Nothing - the suggested camera is default
      }
      else if (test === 'rotate_cad_model') {
        const matrix = model.getModelTransformation();
        const newMatrix = new THREE.Matrix4().multiplyMatrices(matrix, new THREE.Matrix4().makeRotationY(Math.PI / 3.0));
        model.setModelTransformation(newMatrix);
        const cameraConfig = model.suggestCameraConfig();
        camera.near = cameraConfig.near;
        camera.far = cameraConfig.far;
        const { position, target } = cameraConfig;
        controls.setPosition(position.x, position.y, position.z);
        controls.setTarget(target.x, target.y, target.z);
        controls.update(0.0);
      }
      else if (test === "highlight") {
        camera = new THREE.PerspectiveCamera();
        position.x = 12;
        position.y = -4;
        position.z = -45;
        const highlightedTreeIndexes = [...Array(15).keys()];
        highlightedTreeIndexes.forEach(p => pickedNodes.add(p));
        model.requestNodeUpdate(highlightedTreeIndexes);
      } else if (test === "clipping") {
        camera = new THREE.PerspectiveCamera();
        const params = {
          clipIntersection: true,
          width: 10,
          height: 10,
          depth: 10,
          x: 0,
          y: 0,
          z: 0,
          showHelpers: false,
        };

        const boxClipper = new BoundingBoxClipper(
          new THREE.Box3(
            new THREE.Vector3(
              params.x - params.width / 2,
              params.y - params.height / 2,
              params.z - params.depth / 1.5
            ),
            new THREE.Vector3(
              params.x + params.width / 1.5,
              params.y + params.height / 2,
              params.z + params.depth / 2
            )
          ),
          params.clipIntersection
        );

        revealManager.clippingPlanes = boxClipper.clippingPlanes;
        revealManager.clipIntersection = boxClipper.intersection;
      }

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
  return (
    <CanvasWrapper>
      <Loader isLoading={loadingState.isLoading} style={{ position: 'absolute' }}>
        Not ready...
      </Loader>
      <canvas ref={canvas} />
    </CanvasWrapper>
  );
}
