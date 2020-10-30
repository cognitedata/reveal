/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import * as THREE from 'three';
import { CogniteClient } from '@cognite/sdk';
import dat from 'dat.gui';
import {
  AddModelOptions,
  Cognite3DViewer,
  Cognite3DModel,
  CognitePointCloudModel,
  PotreePointColorType, 
  PotreePointShape
} from '@cognite/reveal';
import { getuid } from 'process';
import { createRendererDebugWidget } from '../utils/renderer-debug-widget';

window.THREE = THREE;

export function Migration() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const gui = new dat.GUI();
    let viewer: Cognite3DViewer;

    async function main() {
      const urlParams = new URL(window.location.href).searchParams;
      const project = urlParams.get('project');
      if (!project) {
        throw new Error('Must provide "project"as URL parameter');
      }

      const totalBounds  = new THREE.Box3();

      const slicingParams = {
        enabledX: false,
        enabledY: false,
        enabledZ: false,
        flipX: false,
        flipY: false,
        flipZ: false,
        x: 0,
        y: 0,
        z: 0,
        showHelpers: false,
      };
      const pointCloudParams = {
        pointSize: 1.0,
        budget: 2_000_000,
        pointColorType: PotreePointColorType.Rgb,
        pointShape: PotreePointShape.Circle,
        apply: () => {
          pointCloudModels.forEach(model => {
            model.pointBudget = pointCloudParams.budget;
            model.pointSize = pointCloudParams.pointSize;
            model.pointColorType = pointCloudParams.pointColorType;
            model.pointShape = pointCloudParams.pointShape;
            console.log(model.pointColorType, model.pointShape);
          });
        }
      };

      // Login
      const client = new CogniteClient({ appId: 'cognite.reveal.example' });
      client.loginWithOAuth({ project });
      await client.authenticate();

      const progress = (itemsDownloaded: number, itemsRequested: number) => console.log('onDownload', itemsDownloaded, itemsRequested);
      // Prepare viewer
      viewer = new Cognite3DViewer({
        sdk: client,
        domElement: canvasWrapperRef.current!,
        onLoading: progress,
        logMetrics: false
      });
      (window as any).viewer = viewer;

      async function addModel(options: AddModelOptions) {
        try {
          const model = await viewer.addModel(options);

          const bounds = model.getModelBoundingBox();
          totalBounds.expandByPoint(bounds.min);
          totalBounds.expandByPoint(bounds.max);
          updateSlicingGui();
          viewer.loadCameraFromModel(model);
          if (model instanceof Cognite3DModel) {
            const modelGui = gui.addFolder('Model debug');
            // @ts-expect-error
            const cadNode = model.cadNode;
            // @ts-expect-error
            const renderer = viewer.renderer;
            const sectorMetadata = cadNode._cadModelMetadata.scene.root;
            createRendererDebugWidget(sectorMetadata, renderer, cadNode, modelGui);
  
            cadModels.push(model);
          } else if (model instanceof CognitePointCloudModel) {
            pointCloudModels.push(model);
            pointCloudParams.apply();
          }
        } catch (e) {
          console.error(e);
          alert(`Model ID is invalid or is not supported`);
        }
      }

      // Add GUI for loading models and such
      const cadModels: Cognite3DModel[] = [];
      const pointCloudModels: CognitePointCloudModel[] = [];
      const guiState = {
        modelId: 0,
        revisionId: 0,
        showSectorBoundingBoxes: false,
        drawCalls: 0
      };
      function applySettingsToModels() {
        cadModels.forEach((m) => {
          m.renderHints = {
            ...m.renderHints,
            showSectorBoundingBoxes: guiState.showSectorBoundingBoxes,
          };
        });
      }
      const guiActions = {
        addModel: () =>
          addModel({
            modelId: guiState.modelId,
            revisionId: guiState.revisionId,
          }),
        screenshot: async () => {
          const blob = await viewer.getScreenshot();
          const tab = window.open()!;
          tab.document.body.innerHTML = `
            <img src="${blob}">
            <p>Near: ${(viewer.getCamera() as THREE.PerspectiveCamera).near} Far: ${(viewer.getCamera() as THREE.PerspectiveCamera).far}</p>
          `;
        },
        debugCuller: () => {
          // @ts-ignore
          const debugElement: HTMLCanvasElement = viewer._revealManager._cadManager._cadModelUpdateHandler._sectorCuller.options.coverageUtil.createDebugCanvas(
            { width: 320, height: 400 }
          );
          document.body.appendChild(debugElement);
        },
        makeAllGhost: () => {
          cadModels.forEach(m => m.ghostAllNodes());
        }
      };

      const settingsGui = gui.addFolder('settings');
      settingsGui
        .add(guiState, 'showSectorBoundingBoxes')
        .name('Show bounding boxes')
        .onChange(applySettingsToModels);
      gui.add(guiState, 'modelId').name('Model ID');
      gui.add(guiState, 'revisionId').name('Revision ID');
      gui.add(guiActions, 'addModel').name('Load model');
      gui.add(guiActions, 'screenshot').name('Screenshot');
      gui.add(guiActions, 'debugCuller').name('Culler canvas');
      gui.add(guiActions, 'makeAllGhost').name('Ghost mode');
      const drawcallController = gui.add(guiState, 'drawCalls').name('Draw calls');
      setInterval(() => {
        // @ts-expect-error
        const renderer: THREE.WebGLRenderer = viewer.renderer;
        guiState.drawCalls = renderer.info.render.calls;
        drawcallController.updateDisplay();
      });
      const slicing = gui.addFolder('Slicing');
      
      // X 
      slicing
        .add(slicingParams, 'enabledX')
        .name('X')
        .onChange(updateSlicingPlanes);
      slicing
        .add(slicingParams, 'flipX')
        .name('Flip X')
        .onChange(updateSlicingPlanes);
      const slicingXGui = slicing
        .add(slicingParams, 'x', -600, 600)
        .step(0.1)
        .name('X')
        .onChange(updateSlicingPlanes);
      
      // Y
      slicing
        .add(slicingParams, 'enabledY')
        .name('Y')
        .onChange(updateSlicingPlanes);
      slicing
        .add(slicingParams, 'flipY')
        .name('Flip Y')
        .onChange(updateSlicingPlanes);
      const slicingYGui = slicing
        .add(slicingParams, 'y', -600, 600)
        .step(0.1)
        .name('y')
        .onChange(updateSlicingPlanes);

      // Z
      slicing
        .add(slicingParams, 'enabledZ')
        .name('Z')
        .onChange(updateSlicingPlanes);
      slicing
        .add(slicingParams, 'flipZ')
        .name('Flip Z')
        .onChange(updateSlicingPlanes);
      const slicingZGui = slicing
        .add(slicingParams, 'z', -600, 600)
        .step(0.1)
        .name('z')
        .onChange(updateSlicingPlanes);

      const pcSettings = gui.addFolder('Point clouds');
      pcSettings.add(pointCloudParams, 'budget', 0, 20_000_000, 100_000).onFinishChange(() => pointCloudParams.apply());
      pcSettings.add(pointCloudParams, 'pointSize', 0, 20, 0.25).onFinishChange(() => pointCloudParams.apply());
      pcSettings.add(pointCloudParams, 'pointColorType', {
        Rgb: PotreePointColorType.Rgb,
        Depth: PotreePointColorType.Depth,
        Height: PotreePointColorType.Height,
        PointIndex: PotreePointColorType.PointIndex,
        LevelOfDetail: PotreePointColorType.LevelOfDetail,
        Classification: PotreePointColorType.Classification,
      }).onFinishChange(valueStr => {
        pointCloudParams.pointColorType = parseInt(valueStr, 10);  
        pointCloudParams.apply()
      });
      pcSettings.add(pointCloudParams, 'pointShape', {
        Circle: PotreePointShape.Circle,
        Square: PotreePointShape.Square
      }).onFinishChange(valueStr => {
        pointCloudParams.pointShape = parseInt(valueStr, 10);  
        pointCloudParams.apply()
      });

      // Load model if provided by URL
      const modelIdStr = urlParams.get('modelId');
      const revisionIdStr = urlParams.get('revisionId');
      if (modelIdStr && revisionIdStr) {
        const modelId = Number.parseInt(modelIdStr, 10);
        const revisionId = Number.parseInt(revisionIdStr, 10);
        await addModel({ modelId, revisionId });
      }

      viewer.on('click', async event => {
        const { offsetX, offsetY } = event;
        console.log('2D coordinates', event);
        const intersection = viewer.getIntersectionFromPixel(offsetX, offsetY);
        if (intersection !== null) {
          const { treeIndex, point, model } = intersection;
          console.log(`Clicked node with treeIndex ${treeIndex} at`, point);
          // highlight the object
          model.deselectAllNodes();
          model.selectNodeByTreeIndex(treeIndex);
          const boundingBox = await model.getBoundingBoxByTreeIndex(treeIndex);
          viewer.fitCameraToBoundingBox(boundingBox, 1000);
        }
      });

      function updateSlicingGui() {
        slicingXGui.min(totalBounds.min.x);
        slicingXGui.max(totalBounds.max.x);
        slicingYGui.min(totalBounds.min.y);
        slicingYGui.max(totalBounds.max.y);
        slicingZGui.min(totalBounds.min.z);
        slicingZGui.max(totalBounds.max.z);
      }
  
      function updateSlicingPlanes() {
        const dirX = new THREE.Vector3(1, 0, 0);
        const dirY = new THREE.Vector3(0, -1, 0);
        const dirZ = new THREE.Vector3(0, 0, 1);
        const planes: THREE.Plane[] = [];
        const point = new THREE.Vector3(slicingParams.x, slicingParams.y, slicingParams.z);
        if (slicingParams.enabledX) {
          const normal = dirX.clone().multiplyScalar(slicingParams.flipX ? -1 : 1);
          planes.push(new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point));
        }
        if (slicingParams.enabledY) {
          const normal = dirY.clone().multiplyScalar(slicingParams.flipY ? -1 : 1);
          planes.push(new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point));
        }
        if (slicingParams.enabledZ) {
          const normal = dirZ.clone().multiplyScalar(slicingParams.flipZ ? -1 : 1);
          planes.push(new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point));
        }
        viewer.setSlicingPlanes(planes);
      }  
    }

    main();

    return () => {
      gui.destroy();
      viewer?.dispose();
    };
  });
  return (
    <div>
      <p id='debug'></p>
      <CanvasWrapper ref={canvasWrapperRef} />;
    </div>
  );
    
}
