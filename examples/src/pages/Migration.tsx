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
import { DebugCameraTool, DebugLoadedSectorsTool, DebugLoadedSectorsToolOptions, ExplodedViewTool } from '@cognite/reveal/tools';
import { CadNode } from '@cognite/reveal/experimental';

window.THREE = THREE;

export function Migration() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const gui = new dat.GUI({ width: 500 });
    let viewer: Cognite3DViewer;

    async function main() {
      const url = new URL(window.location.href);
      const urlParams = url.searchParams;
      const project = urlParams.get('project');
      const baseUrl = urlParams.get('baseUrl') || undefined;
      if (!project) {
        throw new Error('Must provide "project"as URL parameter');
      }

      const totalBounds = new THREE.Box3();

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
      const client = new CogniteClient({ appId: 'cognite.reveal.example', baseUrl });
      client.loginWithOAuth({ project });
      await client.authenticate();

      const progress = (itemsDownloaded: number, itemsRequested: number) => console.log('onDownload', itemsDownloaded, itemsRequested);
      // Prepare viewer
      viewer = new Cognite3DViewer({
        sdk: client,
        domElement: canvasWrapperRef.current!,
        onLoading: progress,
        logMetrics: false,
        antiAliasingHint: (urlParams.get('antialias') || undefined) as any,
        ssaoQualityHint: (urlParams.get('ssao') || undefined) as any
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
        antiAliasing: urlParams.get('antialias'),
        ssaoQuality: urlParams.get('ssao'),
        debug: {
          stats: {
            drawCalls: 0,
            points: 0,
            triangles: 0,
            geometries: 0,
            textures: 0,
            renderTime: 0
          },
          loadedSectors: {
            options: {
              showSimpleSectors: true,
              showDetailedSectors: true,
              showDiscardedSectors: false,
              colorBy: 'lod',
              leafsOnly: false
            } as DebugLoadedSectorsToolOptions,
            tool: new DebugLoadedSectorsTool(viewer),
            statistics: {
              insideSectors: 0,
              maxSectorDepth: 0,
              maxSectorDepthOfInsideSectors: 0,
              simpleSectorCount: 0,
              detailedSectorCount: 0,
              forceDetailedSectorCount: 0,
              downloadSizeMb: 0
            }
          },
          suspendLoading: false,
          ghostAllNodes: false,
          hideAllNodes: false
        },
        showCameraTool: new DebugCameraTool(viewer),
        renderMode: 'Color'
      };
      const guiActions = {
        addModel: () =>
          addModel({
            modelId: guiState.modelId,
            revisionId: guiState.revisionId,
          }),
        fitToModel: () => {
          const model = cadModels[0] || pointCloudModels[0];
          viewer.fitCameraToModel(model);
        },
        showSectorBoundingBoxes: () => {
          const { tool, options } = guiState.debug.loadedSectors;
          tool.setOptions(options);
          if (cadModels.length > 0) {
            tool.showSectorBoundingBoxes(cadModels[0]);
          }
        },
        showCameraHelper: () => {
          guiState.showCameraTool.showCameraHelper();
        },
        showBoundsForAllGeometries: () => {
          cadModels.forEach(m => showBoundsForAllGeometries(m));
        }
      };

      gui.add(guiState, 'modelId').name('Model ID');
      gui.add(guiState, 'revisionId').name('Revision ID');
      gui.add(guiActions, 'addModel').name('Load model');
      gui.add(guiActions, 'fitToModel').name('Fit camera');
      const renderModes = [undefined, 'Color', 'Normal', 'TreeIndex', 'PackColorAndNormal', 'Depth', 'Effects', 'Ghost', 'LOD', 'DepthOnly'];
      gui.add(guiState, 'renderMode', renderModes).name('Render mode').onFinishChange(value => {
        const renderMode = renderModes.indexOf(value);
        cadModels.forEach(m => {
          const cadNode: CadNode = (m as any).cadNode;
          cadNode.renderMode = renderMode;
        });
        viewer.forceRerender();
      });
      gui.add(guiState, 'antiAliasing',
        [
          'disabled', 'fxaa', 'msaa4', 'msaa8', 'msaa16',
          'msaa4+fxaa', 'msaa8+fxaa', 'msaa16+fxaa'
        ]).name('Anti-alias').onFinishChange(v => {
          urlParams.set('antialias', v);
          window.location.href = url.toString();
        });
      gui.add(guiState, 'ssaoQuality',
        [
          'disabled', 'medium', 'high', 'veryhigh'
        ]).name('SSAO').onFinishChange(v => {
          urlParams.set('ssao', v);
          window.location.href = url.toString();
        });

      const debugGui = gui.addFolder('Debug');

      const debugStatsGui = debugGui.addFolder('Statistics');
      debugStatsGui.add(guiState.debug.stats, 'drawCalls').name('Draw Calls');
      debugStatsGui.add(guiState.debug.stats, 'points').name('Points');
      debugStatsGui.add(guiState.debug.stats, 'triangles').name('Triangles');
      debugStatsGui.add(guiState.debug.stats, 'geometries').name('Geometries');
      debugStatsGui.add(guiState.debug.stats, 'textures').name('Textures');
      debugStatsGui.add(guiState.debug.stats, 'renderTime').name('Ms/frame');
      
      viewer.on('sceneRendered', sceneRenderedEventArgs => {
        guiState.debug.stats.drawCalls = sceneRenderedEventArgs.renderer.info.render.calls;
        guiState.debug.stats.points = sceneRenderedEventArgs.renderer.info.render.points;
        guiState.debug.stats.triangles = sceneRenderedEventArgs.renderer.info.render.triangles;
        guiState.debug.stats.geometries = sceneRenderedEventArgs.renderer.info.memory.geometries;
        guiState.debug.stats.textures = sceneRenderedEventArgs.renderer.info.memory.textures;
        guiState.debug.stats.renderTime = sceneRenderedEventArgs.renderTime;
        debugStatsGui.updateDisplay();
      });
      
      const debugSectorsGui = debugGui.addFolder('Loaded sectors');

      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'colorBy', ['lod', 'depth']).name('Color by');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'leafsOnly').name('Leaf nodes only');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showSimpleSectors').name('Show simple sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showDetailedSectors').name('Show detailed sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showDiscardedSectors').name('Show discarded sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'insideSectors').name('# sectors@camera');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'maxSectorDepthOfInsideSectors').name('Max sector depth@camera');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'maxSectorDepth').name('Max sector tree depth');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'simpleSectorCount').name('# simple sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'detailedSectorCount').name('# detailed sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'forceDetailedSectorCount').name('# force detailed sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'downloadSizeMb').name('Download size (Mb)');
      
      setInterval(() => {
        let insideSectors = 0;
        let maxInsideDepth = -1;
        let maxDepth = -1;
        const cameraPosition = viewer.getCameraPosition();
        cadModels.forEach(m => {
          m.traverse(x => {
            // Hacky way to access internals of SectorNode
            const depth = (x.hasOwnProperty('depth') && typeof (x as any).depth === 'number') ? (x as any).depth as number : 0;
            if (x.hasOwnProperty('bounds') && (x as any).bounds instanceof THREE.Box3 && (x as any).bounds.containsPoint(cameraPosition)) {
              insideSectors++;
              maxInsideDepth = Math.max(maxInsideDepth, depth);
            }
            maxDepth = Math.max(maxDepth, depth);
          })
        });
        guiState.debug.loadedSectors.statistics.insideSectors = insideSectors;
        guiState.debug.loadedSectors.statistics.maxSectorDepth = maxDepth;
        guiState.debug.loadedSectors.statistics.maxSectorDepthOfInsideSectors = maxInsideDepth;
        // @ts-expect-error
        const loadedStats = viewer._revealManager.cadLoadedStatistics;
        guiState.debug.loadedSectors.statistics.simpleSectorCount = loadedStats.simpleSectorCount;
        guiState.debug.loadedSectors.statistics.detailedSectorCount = loadedStats.detailedSectorCount;
        guiState.debug.loadedSectors.statistics.forceDetailedSectorCount = loadedStats.forcedDetailedSectorCount;
        guiState.debug.loadedSectors.statistics.downloadSizeMb = loadedStats.downloadSize / 1024 / 1024;

        debugSectorsGui.updateDisplay();
      }, 500);

      debugSectorsGui.add(guiActions, 'showSectorBoundingBoxes').name('Show loaded sectors');
      debugGui.add(guiActions, 'showCameraHelper').name('Show camera');
      debugGui.add(guiActions, 'showBoundsForAllGeometries').name('Show geometry bounds');
      debugGui.add(guiState.debug, 'suspendLoading').name('Suspend loading').onFinishChange(suspend => {
        try {
          // @ts-expect-error
          viewer._revealManager._cadManager._cadModelUpdateHandler.updateLoadingHints({suspendLoading: suspend})
        }
        catch (error) {
          alert('Could not toggle suspend loading, check console for error');
          throw error;
        }
      });
      debugGui.add(guiState.debug, 'ghostAllNodes').name('Ghost all nodes').onFinishChange(ghost => {
        if (ghost) {
          cadModels.forEach(m => m.ghostAllNodes());
        } else {
          cadModels.forEach(m => m.unghostAllNodes());
        }
      });
      debugGui.add(guiState.debug, 'hideAllNodes').name('Hide all nodes').onFinishChange(hide => {
        if (hide) {
          cadModels.forEach(m => m.hideAllNodes());
        } else {
          cadModels.forEach(m => m.showAllNodes());
        }
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

      let expandTool: ExplodedViewTool | null;
      let explodeSlider: dat.GUIController | null;

      const assetExplode = gui.addFolder('Asset Inspect');

      const exlopdeParams = { explodeFactor: 0.0, rootTreeIndex: 0 };
      const explodeActions = {
        selectAssetTreeIndex: async () => {
          if (expandTool) {
            explodeActions.reset();
          }

          const rootTreeIndex = exlopdeParams.rootTreeIndex;
          cadModels[0].hideAllNodes();
          cadModels[0].showNodeByTreeIndex(rootTreeIndex, true);

          const rootBoundingBox = await cadModels[0].getBoundingBoxByTreeIndex(rootTreeIndex);
          viewer.fitCameraToBoundingBox(rootBoundingBox, 0);

          expandTool = new ExplodedViewTool(rootTreeIndex, cadModels[0]);

          await expandTool.readyPromise;

          explodeSlider = assetExplode
            .add(exlopdeParams, 'explodeFactor', 0, 1)
            .name('Explode Factor')
            .step(0.01)
            .onChange(p => {
              expandTool!.expand(p);
            });
        },
        reset: () => {
          expandTool?.reset();
          cadModels[0].showAllNodes();
          exlopdeParams.explodeFactor = 0;
          expandTool = null;
          if (explodeSlider) {
            assetExplode.remove(explodeSlider);
            explodeSlider = null;
          }
        }
      };
      assetExplode.add(exlopdeParams, 'rootTreeIndex').name('Tree index');
      assetExplode.add(explodeActions, 'selectAssetTreeIndex').name('Inspect tree index');

      assetExplode.add(explodeActions, 'reset').name('Reset');

      viewer.on('click', async event => {
        const { offsetX, offsetY } = event;
        console.log('2D coordinates', event);
        const intersection = viewer.getIntersectionFromPixel(offsetX, offsetY);
        if (intersection !== null) {
          console.log(intersection);
          switch (intersection.type) {
            case 'cad':
              {
                const { treeIndex, point, model } = intersection;
                console.log(`Clicked node with treeIndex ${treeIndex} at`, point);
                // highlight the object
                model.deselectAllNodes();
                model.selectNodeByTreeIndex(treeIndex);
                model.mapTreeIndexToNodeId(treeIndex).then(p => {
                  console.log(`NodeId: ${p}`);
                }); const boundingBox = await model.getBoundingBoxByTreeIndex(treeIndex);
                viewer.fitCameraToBoundingBox(boundingBox, 1000);
              }
              break;

            case 'pointcloud':
              {
                const { pointIndex, point } = intersection;
                console.log(`Clicked point with pointIndex ${pointIndex} at`, point);
                const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.1), new THREE.MeshBasicMaterial({ color: 'red' }));
                sphere.position.copy(point);
                viewer.addObject3D(sphere);
              }
              break;
          }
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
    

    function showBoundsForAllGeometries(model: Cognite3DModel) {
      model.traverse(x => {
        if (x instanceof THREE.Mesh) {
          const mesh = x;
          const geometry: THREE.Geometry | THREE.BufferGeometry = mesh.geometry;

          if (geometry.boundingBox !== null) {
            const box = geometry.boundingBox.clone();
            box.applyMatrix4(mesh.matrixWorld);

            const boxHelper = new THREE.Box3Helper(box);
            viewer.addObject3D(boxHelper);
          }
        }
      });
    }


    main();

    return () => {
      gui.destroy();
      viewer?.dispose();
    };
  });
  return <CanvasWrapper ref={canvasWrapperRef} />;
}
