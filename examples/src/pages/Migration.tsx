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
  BoundingBoxClipper,
  CognitePointCloudModel,
  PotreePointColorType, 
  PotreePointShape
} from '@cognite/reveal';

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

      const slicingParams = {
        enabled: false,
        width: 100,
        height: 100,
        depth: 100,
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

      const boxClipper = new BoundingBoxClipper(
        new THREE.Box3(
          new THREE.Vector3(
            slicingParams.x - slicingParams.width / 2,
            slicingParams.y - slicingParams.height / 2,
            slicingParams.z - slicingParams.depth / 2
          ),
          new THREE.Vector3(
            slicingParams.x + slicingParams.width / 2,
            slicingParams.y + slicingParams.height / 2,
            slicingParams.z + slicingParams.depth / 2
          )
        ),
        false
      );

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
          viewer.loadCameraFromModel(model);
          if (model instanceof Cognite3DModel) {
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

      const slicing = gui.addFolder('Slicing');
      slicing
        .add(slicingParams, 'enabled')
        .name('enabled')
        .onChange((enabled) => {
          viewer.setSlicingPlanes(enabled ? boxClipper.clippingPlanes : []);
        });

      slicing
        .add(slicingParams, 'x', -600, 600)
        .step(0.1)
        .name('x')
        .onChange((_) => {
          boxClipper.minX = slicingParams.x - slicingParams.width / 2;
          boxClipper.maxX = slicingParams.x + slicingParams.width / 2;
          viewer.setSlicingPlanes(
            slicingParams.enabled ? boxClipper.clippingPlanes : []
          );
        });

      slicing
        .add(slicingParams, 'y', -600, 600)
        .step(0.1)
        .name('y')
        .onChange((_) => {
          boxClipper.minY = slicingParams.y - slicingParams.height / 2;
          boxClipper.maxY = slicingParams.y + slicingParams.height / 2;
          viewer.setSlicingPlanes(
            slicingParams.enabled ? boxClipper.clippingPlanes : []
          );
        });

      slicing
        .add(slicingParams, 'z', -600, 600)
        .step(0.1)
        .name('z')
        .onChange((_) => {
          boxClipper.minZ = slicingParams.z - slicingParams.depth / 2;
          boxClipper.maxZ = slicingParams.z + slicingParams.depth / 2;
          viewer.setSlicingPlanes(
            slicingParams.enabled ? boxClipper.clippingPlanes : []
          );
        });

      slicing
        .add(slicingParams, 'width', 0, 100)
        .step(0.1)
        .name('width')
        .onChange((_) => {
          boxClipper.minX = slicingParams.x - slicingParams.width / 2;
          boxClipper.maxX = slicingParams.x + slicingParams.width / 2;
          viewer.setSlicingPlanes(
            slicingParams.enabled ? boxClipper.clippingPlanes : []
          );
        });

      slicing
        .add(slicingParams, 'height', 0, 100)
        .step(0.1)
        .name('height')
        .onChange((_) => {
          boxClipper.minY = slicingParams.y - slicingParams.height / 2;
          boxClipper.maxY = slicingParams.y + slicingParams.height / 2;
          viewer.setSlicingPlanes(
            slicingParams.enabled ? boxClipper.clippingPlanes : []
          );
        });

      slicing
        .add(slicingParams, 'depth', 0, 100)
        .step(0.1)
        .name('depth')
        .onChange((_) => {
          boxClipper.minZ = slicingParams.z - slicingParams.depth / 2;
          boxClipper.maxZ = slicingParams.z + slicingParams.depth / 2;
          viewer.setSlicingPlanes(
            slicingParams.enabled ? boxClipper.clippingPlanes : []
          );
        });

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
