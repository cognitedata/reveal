/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef, useState } from 'react'
import { CanvasWrapper, Loader } from '../components/styled'

import * as THREE from 'three';
import * as reveal from '@cognite/reveal/experimental';
import { CogniteClient } from '@cognite/sdk';

import CameraControls from 'camera-controls';
import dat, { GUI } from 'dat.gui';
import { getParamsFromURL } from '../utils/example-helpers';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';

CameraControls.install({ THREE });

function initializeGui(
  gui: GUI,
  node: reveal.internal.PointCloudNode,
  handleSettingsChangedCb: () => void
) {
  gui.add(node, 'pointBudget', 0, 20_000_000);
  // gui.add(node, 'visiblePointCount', 0, 20_000_000).onChange(() => { /* Ignore update */ });
  gui.add(node, 'pointSize', 0, 10).onChange(handleSettingsChangedCb);
  gui
    .add(node, 'pointColorType', {
      Rgb: reveal.internal.PotreePointColorType.Rgb,
      Depth: reveal.internal.PotreePointColorType.Depth,
      Height: reveal.internal.PotreePointColorType.Height,
      PointIndex: reveal.internal.PotreePointColorType.PointIndex,
      LevelOfDetail: reveal.internal.PotreePointColorType.LevelOfDetail,
      Classification: reveal.internal.PotreePointColorType.Classification,
    })
    .onChange((valueAsString: string) => {
      const value: reveal.internal.PotreePointColorType = parseInt(
        valueAsString,
        10
      );
      node.pointColorType = value;
      handleSettingsChangedCb();
    });
  gui
    .add(node, 'pointShape', {
      Circle: reveal.internal.PotreePointShape.Circle,
      Square: reveal.internal.PotreePointShape.Square,
    })
    .onChange((valueAsString: string) => {
      const value: reveal.internal.PotreePointShape = parseInt(
        valueAsString,
        10
      );
      node.pointShape = value;
      handleSettingsChangedCb();
    });
  gui.add(node, 'pointSizeType', {
    Adaptive: reveal.internal.PotreePointSizeType.Adaptive,
    Fixed: reveal.internal.PotreePointSizeType.Fixed
  })
}

export function SimplePointcloud() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<reveal.utilities.LoadingState>({ isLoading: false, itemsLoaded: 0, itemsRequested: 0 });

  useEffect(() => {
    let revealManager: reveal.RevealManager<unknown>;
    if (!canvasRef.current) {
      return
    }
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    const gui = new dat.GUI();

    async function main() {
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
      });
      const client = new CogniteClient({
        appId: 'reveal.example.simple-pointcloud',
      });
      client.loginWithOAuth({ project });

      const scene = new THREE.Scene();
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#000000');
      renderer.setSize(window.innerWidth, window.innerHeight);

      let pointCloudNode: reveal.internal.PointCloudNode;
      if(modelRevision) {
        await client.authenticate();
        revealManager = reveal.createCdfRevealManager(client, { logMetrics: false });
        pointCloudNode = await revealManager.addModel('pointcloud', modelRevision);
      } else if(modelUrl) {
        revealManager = reveal.createLocalRevealManager({ logMetrics: false });
        pointCloudNode = await revealManager.addModel('pointcloud', modelUrl);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }      
      scene.add(pointCloudNode);
      revealManager.on('loadingStateChanged', setLoadingState);

      const classesGui = gui.addFolder('Class filters');
      const enabledClasses: { [clazz: number]: boolean } = {};
      console.log(pointCloudNode.getClasses());
      for (const clazz of pointCloudNode.getClasses()) {
        enabledClasses[clazz] = true;
        classesGui.add(enabledClasses, `${clazz}`, true)
          .name(`Class ${clazz}`)
          .onChange(visible => {
            pointCloudNode.setClassVisible(clazz, visible);
          });
      }

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );

      let settingsChanged = false;
      function handleSettingsChanged() {
        settingsChanged = true;
      }
      initializeGui(gui, pointCloudNode, handleSettingsChanged);

      // Create a bounding box around the point cloud for debugging
      const bbox: THREE.Box3 = pointCloudNode.getBoundingBox();
      const bboxHelper = new THREE.Box3Helper(bbox);
      scene.add(bboxHelper);

      const camTarget = bbox.getCenter(new THREE.Vector3());
      const minToCenter = new THREE.Vector3().subVectors(camTarget, bbox.min);
      const camPos = camTarget.clone().addScaledVector(minToCenter, -1.5);
      const controls = new CameraControls(camera, renderer.domElement);
      controls.setLookAt(
        camPos.x,
        camPos.y,
        camPos.z,
        camTarget.x,
        camTarget.y,
        camTarget.z
      );
      controls.update(0.0);
      camera.updateMatrixWorld();

      animationLoopHandler.setOnAnimationFrameListener((deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);

        const needsUpdate =
          controlsNeedUpdate || revealManager.needsRedraw || settingsChanged;

        if (needsUpdate) {
          renderer.render(scene, camera);
          settingsChanged = false;
        }
      });
      animationLoopHandler.start();

      (window as any).scene = scene;
      (window as any).renderer = renderer;
      (window as any).THREE = THREE;
      (window as any).camera = camera;
      (window as any).controls = controls;
      (window as any).model = pointCloudNode;
    }

    main();

    return () => {
      gui.destroy();
      animationLoopHandler.dispose();
      revealManager?.dispose();
    };
  }, []);

  return (
    <CanvasWrapper>
      <Loader isLoading={loadingState.itemsLoaded !== loadingState.itemsRequested} style={{ position: 'absolute' }}>
        Loading...
      </Loader>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
