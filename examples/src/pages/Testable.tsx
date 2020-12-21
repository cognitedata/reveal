/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { getParamsFromURL } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import * as reveal from '@cognite/reveal/experimental';
import React, { useEffect, useRef, useState } from 'react';
import { CanvasWrapper } from '../components/styled';
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
      const transformedNodes: Map<number, THREE.Matrix4> = new Map();

      const ghostedNodes: Set<number> = new Set();

      const onRendered: (() => void)[] = [];

      const nodeAppearanceProvider: reveal.NodeAppearanceProvider = {
        styleNode(treeIndex: number) {
          let style = reveal.DefaultNodeAppearance.NoOverrides;
          if (transformedNodes.has(treeIndex)) {
            return { worldTransform: transformedNodes.get(treeIndex)! };
          }
          if (pickedNodes.has(treeIndex)) {
            style = { ...style, ...reveal.DefaultNodeAppearance.Highlighted };
          }
          if (ghostedNodes.has(treeIndex)) {
            style = { ...style, ...reveal.DefaultNodeAppearance.Ghosted };
          }
          return style;
        }
      };

      let model: reveal.CadNode;
      if (modelRevision) {
        revealManager = reveal.createCdfRevealManager(client, { logMetrics: false });
        model = await revealManager.addModel('cad', modelRevision, nodeAppearanceProvider);
      } else if (modelUrl) {
        revealManager = reveal.createLocalRevealManager({ logMetrics: false });
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
      let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, 2, near, far);

      // Test presets
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      const test = searchParams.get('test');


      if (test === "default_camera") {
        camera = new THREE.PerspectiveCamera();
      } else if (test === "suggested_camera") {
        // Nothing - the suggested camera is default
      } else if (test === 'rotate_cad_model') {
        const matrix = model.getModelTransformation();
        const newMatrix = new THREE.Matrix4().multiplyMatrices(matrix, new THREE.Matrix4().makeRotationY(Math.PI / 3.0));
        model.setModelTransformation(newMatrix);
        const cameraConfig = model.suggestCameraConfig();
        position.copy(cameraConfig.position);
        target.copy(cameraConfig.target);
        near = cameraConfig.near;
        far = cameraConfig.far;
      } else if (test === "highlight") {
        camera = new THREE.PerspectiveCamera();
        position.x = 12;
        position.y = -4;
        position.z = -45;
        const highlightedTreeIndexes = [...Array(15).keys()];
        highlightedTreeIndexes.forEach(p => pickedNodes.add(p));
        model.requestNodeUpdate(highlightedTreeIndexes);

      } else if (test === "node_transform") {

        const transformedTreeIndexes = [...Array(80).keys()].filter(p => p % 2 === 0);
        transformedTreeIndexes.forEach(p => {
          const transform = new THREE.Matrix4();
          transform.makeRotationFromEuler(new THREE.Euler(Math.PI / 2, Math.PI / 2, -Math.PI));
          transform.setPosition(new THREE.Vector3(5, 6, 7));
          transformedNodes.set(p, transform);
        });
        model.requestNodeUpdate(transformedTreeIndexes);

      } else if (test === 'ghost_mode') {
        camera = new THREE.PerspectiveCamera();
        position.x = 45;
        position.y = 3;
        position.z = 13;

        const ghostedTreeIndices = [...Array(32).keys()].map((_value, index) => 2 * index);
        ghostedTreeIndices.forEach(p => ghostedNodes.add(p));
        const highlightedTreeIndexes = [0, 1, 2, 3, 4, 5, 6, 20, 22, 33, 34, 35];
        highlightedTreeIndexes.forEach(p => pickedNodes.add(p));
        model.requestNodeUpdate([...ghostedTreeIndices, ...highlightedTreeIndexes]);
        renderer.setClearColor('magenta');
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
      } else if (test === 'scaled_model') {
        const matrix = model.getModelTransformation();
        const newMatrix = matrix.scale(new THREE.Vector3(5, 5, 5));
        model.setModelTransformation(newMatrix);
      } else if (test === "user_render_target"){
        camera = new THREE.PerspectiveCamera();
        position.x = 10;
        position.y = -5;
        position.z = -26;

        const renderTarget = new THREE.WebGLRenderTarget(300, 300);
        renderTarget.depthTexture = new THREE.DepthTexture(0, 0);
        renderTarget.depthTexture.format = THREE.DepthFormat;
        renderTarget.depthTexture.type = THREE.UnsignedIntType;

        revealManager.setRenderTarget(renderTarget);

        const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-1, -1, 0));
        geometry.vertices.push(new THREE.Vector3(3, -1, 0));
        geometry.vertices.push(new THREE.Vector3(-1, 3, 0));

        const face = new THREE.Face3(0, 1, 2);
        geometry.faces.push(face);

        geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(2, 0), new THREE.Vector2(0, 2)]);

        var material = new THREE.MeshBasicMaterial({map: renderTarget.texture, side: THREE.DoubleSide});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 1.0;

        var material2 = new THREE.MeshBasicMaterial({map: renderTarget.depthTexture, side: THREE.DoubleSide});
        const mesh2 = new THREE.Mesh(geometry, material2);
        mesh2.rotateY(Math.PI);
        mesh2.position.x = -1.0;

        const testScene = new THREE.Scene();
        testScene.add(mesh);
        testScene.add(mesh2);

        const postRender = () => {
          renderer.setRenderTarget(null);
          renderer.render(testScene, orthographicCamera);
        }
        onRendered.push(postRender);
      }

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

          onRendered.forEach(element => {
            element();
          });

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
