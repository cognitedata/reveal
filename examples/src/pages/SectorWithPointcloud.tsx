/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';

import { THREE } from '@cognite/reveal';
import * as reveal from '@cognite/reveal/internals';

import CameraControls from 'camera-controls';
import dat, { GUI } from 'dat.gui';
import {
  RenderOptions,
  applyRenderingFilters,
  RenderMode,
  createDefaultRenderOptions,
} from '../utils/renderer-debug-widget';
import { CogniteClient } from '@cognite/sdk';
import { getParamsFromURL, createSDKFromEnvironment } from '../utils/example-helpers';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { createManagerAndLoadModel } from '../utils/createManagerAndLoadModel';
import { suggestCameraConfig } from '../utils/cameraConfig';

CameraControls.install({ THREE });

function getPointCloudParams() {
  return getParamsFromURL(
    {
      project: 'publicdata',
      modelUrl: 'primitives',
    },
    {
      modelId: 'pointCloudModelId',
      revisionId: 'pointCloudRevisionId',
      modelUrl: 'pointCloudUrl',
    }
  );
}

function initializeGui(
  gui: GUI,
  cadNode: reveal.CadNode,
  pcGroup: reveal.PotreeGroupWrapper,
  pcNode: reveal.PotreeNodeWrapper,
  handleSettingsChangedCb: () => void
): RenderOptions {
  gui
    .add(pcGroup, 'visible')
    .name('Show point cloud')
    .onChange(handleSettingsChangedCb);
  gui
    .add(cadNode, 'visible')
    .name('Show CAD')
    .onChange(handleSettingsChangedCb);
  const pcGui = gui.addFolder('Point cloud');
  pcGui
    .add(pcGroup.position, 'x')
    .name('Offset X')
    .onChange(handleSettingsChangedCb);
  pcGui
    .add(pcGroup.position, 'y')
    .name('Offset Y')
    .onChange(handleSettingsChangedCb);
  pcGui
    .add(pcGroup.position, 'z')
    .name('Offset Z')
    .onChange(handleSettingsChangedCb);
  const rotation = { y: pcGroup.rotation.y };
  pcGui
    .add(rotation, 'y')
    .name('Rotation')
    .onChange((newValue) => {
      pcGroup.setRotationFromEuler(new THREE.Euler(0.0, newValue, 0.0));
      handleSettingsChangedCb();
    });

  pcGui.add(pcGroup, 'pointBudget', 0, 10_000_000);
  pcGui.add(pcNode, 'pointSize', 0, 10).onChange(handleSettingsChangedCb);
  pcGui
    .add(pcNode, 'pointColorType', {
      Rgb: reveal.PotreePointColorType.Rgb,
      Depth: reveal.PotreePointColorType.Depth,
      Height: reveal.PotreePointColorType.Height,
      PointIndex: reveal.PotreePointColorType.PointIndex,
      LevelOfDetail: reveal.PotreePointColorType.LevelOfDetail,
      Classification: reveal.PotreePointColorType.Classification,
    })
    .onChange((valueAsString: string) => {
      const value: reveal.PotreePointColorType = parseInt(
        valueAsString,
        10
      );
      pcNode.pointColorType = value;
      handleSettingsChangedCb();
    });
  pcGui
    .add(pcNode, 'pointShape', {
      Circle: reveal.PotreePointShape.Circle,
      Square: reveal.PotreePointShape.Square,
    })
    .onChange((valueAsString: string) => {
      const value: reveal.PotreePointShape = parseInt(
        valueAsString,
        10
      );
      pcNode.pointShape = value;
      handleSettingsChangedCb();
    });
  return createDefaultRenderOptions();
  // Uncomment to enable debugging widget
  // return createRendererDebugWidget(renderer, scene, gui.addFolder('Debug'));
}

export function SectorWithPointcloud() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const gui = new dat.GUI();
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();

    async function main() {
      const { project, modelUrl, modelRevision, environmentParam } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });

      const {
        modelRevision: pointCloudModelRevision,
        modelUrl: pointCloudUrl,
      } = getPointCloudParams();

      let client;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.hybrid-cad-pointcloud', project, environmentParam);
      } else {
        client = new CogniteClient({ appId: 'reveal.example.hybrid-cad-pointcloud',
                                     project: 'dummy',
                                     getToken: async () => 'dummy' });
      }

      const sceneHandler = new reveal.SceneHandler();

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#000000');
      renderer.setSize(window.innerWidth, window.innerHeight);

      const { revealManager, model } = await createManagerAndLoadModel(client, renderer, sceneHandler, 'cad', modelRevision, modelUrl);
      sceneHandler.addCadModel(model, model.cadModelIdentifier);

      let pointCloud
      if (pointCloudModelRevision) {
        const modelIdentifier = new reveal.CdfModelIdentifier(pointCloudModelRevision.modelId, pointCloudModelRevision.revisionId);
        pointCloud = await revealManager.addModel('pointcloud', modelIdentifier);
      } else if (pointCloudUrl) {
        const modelIdentifier = new reveal.LocalModelIdentifier(pointCloudUrl.fileName!);
        pointCloud = await revealManager.addModel('pointcloud', modelIdentifier);
      } else {
        throw new Error(
          'Need to provide either project & pointCloud OR pointCloudlUrl as query parameters'
        );
      }

      const pointCloudGroup = pointCloud.potreeGroup;
      const pointCloudNode = pointCloud.potreeNode;
      sceneHandler.addCustomObject(pointCloudGroup);

      let settingsChanged = false;
      function handleSettingsChanged() {
        settingsChanged = true;
      }
      const renderOptions = initializeGui(
        gui,
        model,
        pointCloudGroup,
        pointCloudNode,
        handleSettingsChanged
      );

      const { position, target, near, far } =
        suggestCameraConfig(model.cadModelMetadata.scene.root,
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

      animationLoopHandler.setOnAnimationFrameListener(async (deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);
        if (renderOptions.loadingEnabled) {
          revealManager.update(camera);
        }
        const needsUpdate =
          renderOptions.renderMode === RenderMode.AlwaysRender ||
          (renderOptions.renderMode === RenderMode.WhenNecessary &&
            (controlsNeedUpdate ||
              revealManager.needsRedraw ||
              pointCloudGroup.needsRedraw ||
              settingsChanged));

        if (needsUpdate) {
          applyRenderingFilters(sceneHandler.scene, renderOptions.renderFilter);
          revealManager.render(camera);
          settingsChanged = false;
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
      gui.destroy();
    };
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
