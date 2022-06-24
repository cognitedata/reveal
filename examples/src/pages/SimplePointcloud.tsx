/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef, useState } from 'react'
import { CanvasWrapper, Loader } from '../components/styled'

import { PotreePointColorType, PotreePointShape, PotreePointSizeType } from '@cognite/reveal';
import * as THREE from 'three';
import { CogniteClient } from '@cognite/sdk';

import CameraControls from 'camera-controls';
import dat, { GUI } from 'dat.gui';
import { createSDKFromEnvironment, getParamsFromURL } from '../utils/example-helpers';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { ClippingUI } from '../utils/ClippingUI';
import { createManagerAndLoadModel } from '../utils/createManagerAndLoadModel';
import { LoadingState, PointCloudNode, RevealManager, SceneHandler } from '@cognite/reveal/internals';

CameraControls.install({ THREE });

class RevealManagerUpdater {

  private _revealManager: RevealManager;

  constructor(revealManager: RevealManager) {
    this._revealManager = revealManager;
  }

  public get pointCloudBudget(): number {
    return this._revealManager.pointCloudBudget.numberOfPoints;
  }

  public set pointCloudBudget(val: number) {
    this._revealManager.pointCloudBudget = { numberOfPoints: val };
  }
}

function initializeGui(
  gui: GUI,
  node: PointCloudNode,
  revealManagerUpdater: RevealManagerUpdater,
  handleSettingsChangedCb: () => void
) {
  gui.add(revealManagerUpdater, 'pointCloudBudget', 0, 20_000_000);
  gui.add(node, 'visiblePointCount', 0, 20_000_000).onChange(() => { /* Ignore update */ });
  gui.add(node, 'pointSize', 0, 10).onChange(handleSettingsChangedCb);
  gui
    .add(node, 'pointColorType', {
      Rgb: PotreePointColorType.Rgb,
      Depth: PotreePointColorType.Depth,
      Height: PotreePointColorType.Height,
      PointIndex: PotreePointColorType.PointIndex,
      LevelOfDetail: PotreePointColorType.LevelOfDetail,
      Classification: PotreePointColorType.Classification,
    })
    .onChange((valueAsString: string) => {
      const value: PotreePointColorType = parseInt(
        valueAsString,
        10
      );
      node.pointColorType = value;
      handleSettingsChangedCb();
    });
  gui
    .add(node, 'pointShape', {
      Circle: PotreePointShape.Circle,
      Square: PotreePointShape.Square,
    })
    .onChange((valueAsString: string) => {
      const value: PotreePointShape = parseInt(
        valueAsString,
        10
      );
      node.pointShape = value;
      handleSettingsChangedCb();
    });
  gui.add(node, 'pointSizeType', {
    Adaptive: PotreePointSizeType.Adaptive,
    Fixed: PotreePointSizeType.Fixed
  })
}

export function SimplePointcloud() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, itemsLoaded: 0, itemsRequested: 0, itemsCulled: 0 });

  useEffect(() => {
    let revealManager: RevealManager;
    if (!canvasRef.current) {
      return
    }
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    const gui = new dat.GUI();

    async function main() {
      const { project, modelUrl, modelRevision, environmentParam } = getParamsFromURL({
        project: 'publicdata',
      });

      let client;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.simplepointcloud', project, environmentParam);
      } else {
        client = new CogniteClient({ appId: 'reveal.example.simplepointcloud',
                                     project: 'dummy',
                                     getToken: async () => 'dummy' });
      }

      const sceneHandler = new SceneHandler();
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#444444');
      renderer.setSize(window.innerWidth, window.innerHeight);

      const { revealManager, model: pointCloudNode } = await createManagerAndLoadModel(client, renderer, sceneHandler, 'pointcloud', modelRevision, modelUrl);
      sceneHandler.addCustomObject(pointCloudNode);
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

      const clippingUi = new ClippingUI(gui.addFolder('Clipping'), planes => {
        revealManager.clippingPlanes = planes;
      });
      clippingUi.updateWorldBounds(pointCloudNode.getBoundingBox());

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
      initializeGui(gui, pointCloudNode, new RevealManagerUpdater(revealManager), handleSettingsChanged);

      // Create a bounding box around the point cloud for debugging
      const bbox: THREE.Box3 = pointCloudNode.getBoundingBox();
      const bboxHelper = new THREE.Box3Helper(bbox);
      sceneHandler.addCustomObject(bboxHelper);

      const controls = new CameraControls(camera, renderer.domElement);

      const camTarget = bbox.getCenter(new THREE.Vector3());
      const minToCenter = new THREE.Vector3().subVectors(camTarget, bbox.min);
      const camPos = camTarget.clone().addScaledVector(minToCenter, -1.5);
      controls.setLookAt(
        camPos.x,
        camPos.y,
        camPos.z,
        camTarget.x,
        camTarget.y,
        camTarget.z
      );

      animationLoopHandler.setOnAnimationFrameListener((deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);

        revealManager.update(camera);

        const needsUpdate =
          controlsNeedUpdate || revealManager.needsRedraw || settingsChanged;

        if (needsUpdate) {
          revealManager.render(camera);
          settingsChanged = false;
        }
      });
      animationLoopHandler.start();

      (window as any).sceneHandler = sceneHandler;
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
