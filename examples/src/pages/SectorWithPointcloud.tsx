/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';

import * as THREE from 'three';
import * as Potree from '@cognite/potree-core';
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
import { getParamsFromURL, authenticateSDKWithEnvironment } from '../utils/example-helpers';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { createManagerAndLoadModel } from '../utils/createManagerAndLoadModel';

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

  pcGui.add(pcNode, 'pointBudget', 0, 10_000_000);
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

      const client = new CogniteClient({
        appId: 'reveal.example.hybrid-cad-pointcloud',
      });
      if ((modelRevision || pointCloudModelRevision) && environmentParam) {
        await authenticateSDKWithEnvironment(client, project, environmentParam);
      }

      const scene = new THREE.Scene();

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#000000');
      renderer.setSize(window.innerWidth, window.innerHeight);

      Potree.XHRFactory.config.customHeaders.push({
        header: 'MyDummyHeader',
        value: 'MyDummyValue',
      });

      const { revealManager, model } = await createManagerAndLoadModel(client, renderer, scene, 'cad', modelRevision, modelUrl);
      scene.add(model);

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

      // fixme: something wrong with the types here.
      //    Why THREE.Group can be destructured like that?
      //    example is broken here. It fails at runtime.
      const [pointCloudGroup, pointCloudNode] = pointCloud as unknown as [
        reveal.PotreeGroupWrapper,
        reveal.PotreeNodeWrapper
      ];
      scene.add(pointCloudGroup);

      const cadModelOffsetRoot = new THREE.Group();
      cadModelOffsetRoot.name = 'Sector model offset root';
      cadModelOffsetRoot.add(model);
      scene.add(cadModelOffsetRoot);

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
          applyRenderingFilters(scene, renderOptions.renderFilter);
          renderer.render(scene, camera);
          settingsChanged = false;
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
      gui.destroy();
    };
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
