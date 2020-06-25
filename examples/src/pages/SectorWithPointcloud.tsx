/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';

import * as THREE from 'three';
import * as Potree from '@cognite/potree-core';
import * as reveal from '@cognite/reveal/experimental';

import CameraControls from 'camera-controls';
import dat, { GUI } from 'dat.gui';
import {
  RenderOptions,
  applyRenderingFilters,
  RenderMode,
  createDefaultRenderOptions,
} from '../utils/renderer-debug-widget';
import { CogniteClient } from '@cognite/sdk';
import {
  getParamsFromURL,
  createRenderManager,
} from '../utils/example-helpers';

CameraControls.install({ THREE });

function getPointCloudParams() {
  return getParamsFromURL({
    project: 'publicdata',
    modelUrl: 'primitives',
  }, {modelId: 'pointCloudModelId', revisionId: 'pointCloudRevisionId', modelUrl: 'pointCloudUrl'});
}

function initializeGui(
  gui: GUI,
  cadNode: reveal.CadNode,
  pcGroup: reveal.internal.PotreeGroupWrapper,
  pcNode: reveal.internal.PotreeNodeWrapper,
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
      pcNode.pointColorType = value;
      handleSettingsChangedCb();
    });
  pcGui
    .add(pcNode, 'pointShape', {
      Circle: reveal.internal.PotreePointShape.Circle,
      Square: reveal.internal.PotreePointShape.Square,
    })
    .onChange((valueAsString: string) => {
      const value: reveal.internal.PotreePointShape = parseInt(
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

    async function main() {
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const { modelRevision: pointCloudModelRevision, modelUrl: pointCloudUrl } = getPointCloudParams();
      const client = new CogniteClient({
        appId: 'reveal.example.hybrid-cad-pointcloud',
      });
      client.loginWithOAuth({ project });

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

      const revealManager: reveal.RenderManager = createRenderManager(
        modelRevision !== undefined ? 'cdf' : 'local',
        client
      );

      let model: reveal.CadNode;
      if (
        revealManager instanceof reveal.LocalHostRevealManager &&
        modelUrl !== undefined
      ) {
        model = await revealManager.addModel('cad', modelUrl);
      } else if (
        revealManager instanceof reveal.RevealManager &&
        modelRevision !== undefined
      ) {
        await client.authenticate();
        model = await revealManager.addModel('cad', modelRevision);
      } else {
        console.log(pointCloudModelRevision);
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }
      scene.add(model);

      let pointCloud: [
        reveal.internal.PotreeGroupWrapper,
        reveal.internal.PotreeNodeWrapper
      ];
      if (
        revealManager instanceof reveal.LocalHostRevealManager &&
        pointCloudUrl !== undefined
      ) {
        pointCloud = await revealManager.addModel('pointcloud', pointCloudUrl);
      } else if (
        revealManager instanceof reveal.RevealManager &&
        pointCloudModelRevision !== undefined
      ) {
        await client.authenticate();
        pointCloud = await revealManager.addModel(
          'pointcloud',
          pointCloudModelRevision
        );
      } else {
        console.log(pointCloudModelRevision);
        throw new Error(
          'Need to provide either project & pointCloud OR pointCloudlUrl as query parameters'
        );
      }
      const [pointCloudGroup, pointCloudNode] = pointCloud;
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

      const clock = new THREE.Clock();
      const render = async () => {
        const delta = clock.getDelta();
        const controlsNeedUpdate = controls.update(delta);
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
        requestAnimationFrame(render);
      };
      render();

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
