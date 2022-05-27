/*
 * Copyright 2021 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import { THREE } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import dat from 'dat.gui';
import {
  Cognite3DViewer,
  Cognite3DViewerOptions,
  Cognite3DModel,
  CognitePointCloudModel,
  CameraControlsOptions,
  TreeIndexNodeCollection,
  CogniteModelBase,
  DefaultCameraManager
} from '@cognite/reveal';
import { DebugCameraTool, DebugLoadedSectorsTool, DebugLoadedSectorsToolOptions, ExplodedViewTool, AxisViewTool } from '@cognite/reveal/tools';
import * as reveal from '@cognite/reveal';
import { ClippingUI } from '../utils/ClippingUI';
import { NodeStylingUI } from '../utils/NodeStylingUI';
import { BulkHtmlOverlayUI } from '../utils/BulkHtmlOverlayUI';
import { initialCadBudgetUi } from '../utils/CadBudgetUi';
import { InspectNodeUI } from '../utils/InspectNodeUi';
import { CameraUI } from '../utils/CameraUI';
import { PointCloudUi } from '../utils/PointCloudUi';
import { ModelUi } from '../utils/ModelUi';
import { createSDKFromEnvironment } from '../utils/example-helpers';
import { PointCloudClassificationFilterUI } from '../utils/PointCloudClassificationFilterUI';


window.THREE = THREE;
(window as any).reveal = reveal;

export function Migration() {

  const url = new URL(window.location.href);
  const urlParams = url.searchParams;
  const environmentParam = urlParams.get('env');

  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gui = new dat.GUI({ width: Math.min(500, 0.8 * window.innerWidth) });
    let viewer: Cognite3DViewer;
    let cameraManager: DefaultCameraManager;

    async function main() {
      const project = urlParams.get('project');
      const modelUrl = urlParams.get('modelUrl');

      if (!modelUrl && !(environmentParam && project)) {
        throw Error('Must specify URL parameters "project" and "env", or "modelUrl"');
      }

      const progress = (itemsLoaded: number, itemsRequested: number, itemsCulled: number) => {
        guiState.debug.loadedSectors.statistics.culledCount = itemsCulled;
        if (itemsLoaded === 0 || itemsLoaded === itemsRequested) {
          console.log(`loaded ${itemsLoaded}/${itemsRequested} (culled: ${itemsCulled})`);
        }
      };

      let client: CogniteClient;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.example', project, environmentParam);
      } else {
        client = new CogniteClient({ appId: 'reveal.example.example',
                                     project: 'dummy',
                                     getToken: async () => 'dummy' });
      }

      let viewerOptions: Cognite3DViewerOptions = {
        sdk: client,
        domElement: canvasWrapperRef.current!,
        onLoading: progress,
        logMetrics: false,
        antiAliasingHint: (urlParams.get('antialias') || undefined) as any,
        ssaoQualityHint: (urlParams.get('ssao') || undefined) as any,
        continuousModelStreaming: true
      };

      if (modelUrl !== null) {
        viewerOptions = {
          ...viewerOptions,
          // @ts-expect-error
          _localModels: true
        };
      } else if (!(project && environmentParam)) {
        throw new Error('Must either provide URL parameters "env", "project", ' +
                        '"modelId" and "revisionId" to load model from CDF ' +
                        '"or "modelUrl" to load model from URL.');
      }

      // Prepare viewer
      viewer = new Cognite3DViewer(viewerOptions);
      (window as any).viewer = viewer;

      const controlsOptions: CameraControlsOptions = {
        changeCameraTargetOnClick: true,
        mouseWheelAction: 'zoomToCursor',
      };
      cameraManager = viewer.cameraManager as DefaultCameraManager;

      cameraManager.setCameraControlsOptions(controlsOptions);

      // Add GUI for loading models and such
      const guiState = {
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
              leafsOnly: false,
              sectorPathFilterRegex: '^.*/$'
            } as DebugLoadedSectorsToolOptions,
            tool: new DebugLoadedSectorsTool(viewer),
            statistics: {
              insideSectors: 0,
              maxSectorDepth: 0,
              maxSectorDepthOfInsideSectors: 0,
              simpleSectorCount: 0,
              detailedSectorCount: 0,
              culledCount: 0,
              forceDetailedSectorCount: 0,
              downloadSizeMb: 0
            }
          },
          suspendLoading: false,
          ghostAllNodes: false,
          hideAllNodes: false
        },
        showCameraTool: new DebugCameraTool(viewer),
        renderMode: 'Color',
        controls: {
          mouseWheelAction: 'zoomToCursor',
          changeCameraTargetOnClick: true
        }
      };
      const guiActions = {
        showSectorBoundingBoxes: () => {
          const { tool, options } = guiState.debug.loadedSectors;
          tool.setOptions(options);
          if (modelUi.cadModels.length > 0) {
            tool.showSectorBoundingBoxes(modelUi.cadModels[0]);
          }
        },
        showCameraHelper: () => {
          guiState.showCameraTool.showCameraHelper();
        },
        showBoundsForAllGeometries: () => {
          modelUi.cadModels.forEach(m => showBoundsForAllGeometries(m));
        }
      };
      initialCadBudgetUi(viewer, gui.addFolder('CAD budget'));


      const totalBounds = new THREE.Box3();
      function handleModelAdded(model: CogniteModelBase) {
        const bounds = model.getModelBoundingBox();
        totalBounds.expandByPoint(bounds.min);
        totalBounds.expandByPoint(bounds.max);
        clippingUi.updateWorldBounds(totalBounds);

        viewer.loadCameraFromModel(model);
        if (model instanceof Cognite3DModel) {
          new NodeStylingUI(gui.addFolder(`Node styling #${modelUi.cadModels.length}`), client, model);
          new BulkHtmlOverlayUI(gui.addFolder(`Node tagging #${modelUi.cadModels.length}`), viewer, model, client);
        } else if (model instanceof CognitePointCloudModel) {
          new PointCloudClassificationFilterUI(gui.addFolder(`Class filter #${modelUi.pointCloudModels.length}`), model);
          pointCloudUi.applyToAllModels();
        }
      }
      const modelUi = new ModelUi(gui.addFolder('Models'), viewer, handleModelAdded);

      const renderGui = gui.addFolder('Rendering');
      const renderModes = ['Color', 'Normal', 'TreeIndex', 'PackColorAndNormal', 'Depth', 'Effects', 'Ghost', 'LOD', 'DepthBufferOnly (N/A)', 'GeometryType'];
      renderGui.add(guiState, 'renderMode', renderModes).name('Render mode').onFinishChange(value => {
        const renderMode = renderModes.indexOf(value) + 1;
        (viewer as any).revealManager._renderPipeline._cadGeometryRenderPipeline._cadGeometryRenderPasses.back._renderMode = renderMode;
        viewer.requestRedraw();
      });
      renderGui.add(guiState, 'antiAliasing',
        [
          'disabled', 'fxaa', 'msaa4', 'msaa8', 'msaa16',
          'msaa4+fxaa', 'msaa8+fxaa', 'msaa16+fxaa'
        ]).name('Anti-alias').onFinishChange(v => {
          urlParams.set('antialias', v);
          window.location.href = url.toString();
        });
      renderGui.add(guiState, 'ssaoQuality',
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

      viewer.on('sceneRendered', (sceneRenderedEventArgs) => {
        guiState.debug.stats.drawCalls = sceneRenderedEventArgs.renderer.info.render.calls;
        guiState.debug.stats.points = sceneRenderedEventArgs.renderer.info.render.points;
        guiState.debug.stats.triangles = sceneRenderedEventArgs.renderer.info.render.triangles;
        guiState.debug.stats.geometries = sceneRenderedEventArgs.renderer.info.memory.geometries;
        guiState.debug.stats.textures = sceneRenderedEventArgs.renderer.info.memory.textures;
        guiState.debug.stats.renderTime = sceneRenderedEventArgs.renderTime;
        debugStatsGui.updateDisplay();
      });

      const debugSectorsGui = debugGui.addFolder('Loaded sectors');

      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'colorBy', ['lod', 'depth', 'loadedTimestamp', 'drawcalls', 'random']).name('Color by');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'leafsOnly').name('Leaf nodes only');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showSimpleSectors').name('Show simple sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showDetailedSectors').name('Show detailed sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showDiscardedSectors').name('Show discarded sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'sectorPathFilterRegex').name('Sectors path filter');
      debugSectorsGui.add(guiActions, 'showSectorBoundingBoxes').name('Show sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'insideSectors').name('# sectors@camera');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'maxSectorDepthOfInsideSectors').name('Max sector depth@camera');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'maxSectorDepth').name('Max sector tree depth');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'simpleSectorCount').name('# simple sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'detailedSectorCount').name('# detailed sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'forceDetailedSectorCount').name('# force detailed sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'culledCount').name('# culled sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'downloadSizeMb').name('Download size (Mb)');

      setInterval(() => {
        let insideSectors = 0;
        let maxInsideDepth = -1;
        let maxDepth = -1;
        const cameraPosition = cameraManager.getCameraState().position;
        modelUi.cadModels.forEach(m => {
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
        const loadedStats = viewer.revealManager.cadLoadedStatistics;
        guiState.debug.loadedSectors.statistics.simpleSectorCount = loadedStats.simpleSectorCount;
        guiState.debug.loadedSectors.statistics.detailedSectorCount = loadedStats.detailedSectorCount;
        guiState.debug.loadedSectors.statistics.forceDetailedSectorCount = loadedStats.forcedDetailedSectorCount;
        guiState.debug.loadedSectors.statistics.downloadSizeMb = loadedStats.downloadSize / 1024 / 1024;

        debugSectorsGui.updateDisplay();
      }, 500);

      debugGui.add(guiActions, 'showCameraHelper').name('Show camera');
      debugGui.add(guiActions, 'showBoundsForAllGeometries').name('Show geometry bounds');
      debugGui.add(guiState.debug, 'suspendLoading').name('Suspend loading').onFinishChange(suspend => {
        try {
          // @ts-expect-error
          viewer.revealManager._cadManager._cadModelUpdateHandler.updateLoadingHints({ suspendLoading: suspend })
        }
        catch (error) {
          alert('Could not toggle suspend loading, check console for error');
          throw error;
        }
      });
      debugGui.add(guiState.debug, 'ghostAllNodes').name('Ghost all nodes').onFinishChange(ghost => {
        modelUi.cadModels.forEach(m => m.setDefaultNodeAppearance({ renderGhosted: ghost }));
      });
      debugGui.add(guiState.debug, 'hideAllNodes').name('Hide all nodes').onFinishChange(hide => {
        modelUi.cadModels.forEach(m => m.setDefaultNodeAppearance({ visible: !hide }));
      });

      const clippingUi = new ClippingUI(gui.addFolder('Clipping'), planes => viewer.setClippingPlanes(planes));
      new CameraUI(viewer, gui.addFolder('Camera'));
      const pointCloudUi = new PointCloudUi(viewer, gui.addFolder('Point clouds'));
      await modelUi.restoreModelsFromUrl();

      let expandTool: ExplodedViewTool | null;
      let explodeSlider: dat.GUIController | null;

      const assetExplode = gui.addFolder('Asset Inspect');

      const explodeParams = { explodeFactor: 0.0, rootTreeIndex: 0 };
      const explodeActions = {
        selectAssetTreeIndex: async () => {
          if (expandTool) {
            explodeActions.reset();
          }

          const rootTreeIndex = explodeParams.rootTreeIndex;
          const treeIndices = await modelUi.cadModels[0].getSubtreeTreeIndices(rootTreeIndex);
          modelUi.cadModels[0].setDefaultNodeAppearance({ visible: false });
          const explodeSet = new TreeIndexNodeCollection(treeIndices);
          modelUi.cadModels[0].assignStyledNodeCollection(explodeSet, { visible: true });

          const rootBoundingBox = await modelUi.cadModels[0].getBoundingBoxByTreeIndex(rootTreeIndex);
          viewer.fitCameraToBoundingBox(rootBoundingBox, 0);

          expandTool = new ExplodedViewTool(rootTreeIndex, modelUi.cadModels[0]);

          await expandTool.readyPromise;

          explodeSlider = assetExplode
            .add(explodeParams, 'explodeFactor', 0, 1)
            .name('Explode Factor')
            .step(0.01)
            .onChange(p => {
              expandTool!.expand(p);
            });
        },
        reset: () => {
          expandTool?.reset();
          modelUi.cadModels[0].setDefaultNodeAppearance({ visible: true });
          modelUi.cadModels[0].removeAllStyledNodeCollections();
          explodeParams.explodeFactor = 0;
          expandTool = null;
          if (explodeSlider) {
            assetExplode.remove(explodeSlider);
            explodeSlider = null;
          }
        }
      };
      assetExplode.add(explodeParams, 'rootTreeIndex').name('Tree index');
      assetExplode.add(explodeActions, 'selectAssetTreeIndex').name('Inspect tree index');

      assetExplode.add(explodeActions, 'reset').name('Reset');

      const controlsGui = gui.addFolder('Camera controls');
      const mouseWheelActionTypes = ['zoomToCursor', 'zoomPastCursor', 'zoomToTarget'];
      controlsGui.add(guiState.controls, 'mouseWheelAction', mouseWheelActionTypes).name('Mouse wheel action type').onFinishChange(value => {
        cameraManager.setCameraControlsOptions({ ...cameraManager.getCameraControlsOptions(), mouseWheelAction: value });
      });
      controlsGui.add(guiState.controls, 'changeCameraTargetOnClick').name('Change camera target on click').onFinishChange(value => {
        cameraManager.setCameraControlsOptions({ ...cameraManager.getCameraControlsOptions(), changeCameraTargetOnClick: value });
      });

      const inspectNodeUi = new InspectNodeUI(gui.addFolder('Last clicked node'), client, viewer);

      viewer.on('click', async (event) => {
        const { offsetX, offsetY } = event; 
        console.log('2D coordinates', event);
        const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
        if (intersection !== null) {
          console.log(intersection);
          switch (intersection.type) {
            case 'cad':
              {
                const { treeIndex, point } = intersection;
                console.log(`Clicked node with treeIndex ${treeIndex} at`, point);

                inspectNodeUi.inspectNode(intersection.model, treeIndex);
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

      new AxisViewTool(viewer);
    }

    function showBoundsForAllGeometries(model: Cognite3DModel) {
      const boxes = new THREE.Group();
      model.getModelTransformation(boxes.matrix);
      boxes.matrixWorldNeedsUpdate = true;

      model.traverse(x => {
        if (x instanceof THREE.Mesh) {
          const mesh = x;
          const geometry: THREE.BufferGeometry = mesh.geometry;

          if (geometry.boundingBox !== null) {
            const box = geometry.boundingBox.clone();
            box.applyMatrix4(mesh.matrixWorld);

            const boxHelper = new THREE.Box3Helper(box);
            boxes.add(boxHelper);
          }
        }
      });
      viewer.addObject3D(boxes);
    }

    main();

    return () => {
      gui.destroy();
      viewer?.dispose();
    };
  });
  return <CanvasWrapper ref={canvasWrapperRef} />;
}
