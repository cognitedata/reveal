/*
 * Copyright 2021 Cognite AS
 */
import React, { useEffect, useRef } from 'react';
import { THREE } from '@cognite/reveal';
import * as reveal from '@cognite/reveal/internals';
import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import { getParamsFromURL, createSDKFromEnvironment } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { BoundingBoxClipper } from '@cognite/reveal';
import { CanvasWrapper } from '../components/styled';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { createManagerAndLoadModel } from '../utils/createManagerAndLoadModel';
import { suggestCameraConfig } from '../utils/cameraConfig';

CameraControls.install({ THREE });

export function Clipping() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const gui = new dat.GUI();
    let revealManager: reveal.RevealManager;
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();

    async function main() {
      const { project, modelUrl, modelRevision, environmentParam } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });

      let client;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.clipping', project, environmentParam);
      } else {
        client = new CogniteClient({ appId: 'reveal.example.clipping',
                                     project: 'dummy',
                                     getToken: async () => 'dummy' });
      }

      const sceneHandler = new reveal.SceneHandler();
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.localClippingEnabled = true;
      renderer.setClearColor('#444');
      renderer.setSize(window.innerWidth, window.innerHeight);

      const { revealManager, model } = await createManagerAndLoadModel(client, renderer, sceneHandler, 'cad', modelRevision, modelUrl);
      sceneHandler.addCadModel(model, model.cadModelIdentifier);

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

      const params = {
        width: 10,
        height: 10,
        depth: 10,
        x: 0,
        y: 0,
        z: 0,
        showHelpers: false,
      };

      let guiNeedsUpdate = true;

      const boxClipper = new BoundingBoxClipper(
        new THREE.Box3(
          new THREE.Vector3(
            params.x - params.width / 2,
            params.y - params.height / 2,
            params.z - params.depth / 2
          ),
          new THREE.Vector3(
            params.x + params.width / 2,
            params.y + params.height / 2,
            params.z + params.depth / 2
          )
        )
      );

      function updateClippingPlanes() {
        revealManager.clippingPlanes = boxClipper.clippingPlanes;
      }
      updateClippingPlanes();

      const helpers = new THREE.Group();
      helpers.add(
        new THREE.PlaneHelper(boxClipper.clippingPlanes[0], 2, 0xff0000)
      );
      helpers.add(
        new THREE.PlaneHelper(boxClipper.clippingPlanes[1], 2, 0xff0000)
      );
      helpers.add(
        new THREE.PlaneHelper(boxClipper.clippingPlanes[2], 2, 0x00ff00)
      );
      helpers.add(
        new THREE.PlaneHelper(boxClipper.clippingPlanes[3], 2, 0x00ff00)
      );
      helpers.add(
        new THREE.PlaneHelper(boxClipper.clippingPlanes[4], 2, 0x0000ff)
      );
      helpers.add(
        new THREE.PlaneHelper(boxClipper.clippingPlanes[5], 2, 0x0000ff)
      );
      updateClippingPlanes();
      sceneHandler.addCustomObject(helpers);

      animationLoopHandler.setOnAnimationFrameListener(async (deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (controlsNeedUpdate || revealManager.needsRedraw || guiNeedsUpdate) {
          revealManager.render(camera);
          guiNeedsUpdate = false;
          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();

      gui
        .add(params, 'x', -600, 600)
        .step(0.1)
        .name('x')
        .onChange((_) => {
          boxClipper.minX = params.x - params.width / 2;
          boxClipper.maxX = params.x + params.width / 2;
          updateClippingPlanes();
        });

      gui
        .add(params, 'y', -600, 600)
        .step(0.1)
        .name('y')
        .onChange((_) => {
          boxClipper.minY = params.y - params.height / 2;
          boxClipper.maxY = params.y + params.height / 2;
          updateClippingPlanes();
        });

      gui
        .add(params, 'z', -600, 600)
        .step(0.1)
        .name('z')
        .onChange((_) => {
          boxClipper.minZ = params.z - params.depth / 2;
          boxClipper.maxZ = params.z + params.depth / 2;
          updateClippingPlanes();
        });

      gui
        .add(params, 'width', 0, 10000)
        .step(0.1)
        .name('width')
        .onChange((_) => {
          boxClipper.minX = params.x - params.width / 2;
          boxClipper.maxX = params.x + params.width / 2;
          updateClippingPlanes();
        });

      gui
        .add(params, 'height', 0, 10000)
        .step(0.1)
        .name('height')
        .onChange((_) => {
          boxClipper.minY = params.y - params.height / 2;
          boxClipper.maxY = params.y + params.height / 2;
          updateClippingPlanes();
        });

      gui
        .add(params, 'depth', 0, 10000)
        .step(0.1)
        .name('depth')
        .onChange((_) => {
          boxClipper.minZ = params.z - params.depth / 2;
          boxClipper.maxZ = params.z + params.depth / 2;
          updateClippingPlanes();
        });

      gui
        .add(params, 'showHelpers')
        .name('show helpers')
        .onChange((value) => {
          helpers.visible = value;
          guiNeedsUpdate = true;
        });

      (window as any).sceneHandler = sceneHandler;
      (window as any).THREE = THREE;
      (window as any).camera = camera;
      (window as any).controls = controls;
    }

    main();

    return () => {
      gui.destroy();
      revealManager?.dispose();
      animationLoopHandler.dispose();
    };
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
