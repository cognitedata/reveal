/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import { createSDKFromEnvironment } from '../utils/example-helpers';
import * as THREE from 'three';
import { CogniteClient } from '@cognite/sdk';
import dat from 'dat.gui';
import {
  AddModelOptions,
  Cognite3DViewer,
  Cognite3DModel,
  CognitePointCloudModel,
  PotreePointColorType, 
  PotreePointShape,
  TreeIndexNodeCollection,
  IndexSet
} from '@cognite/reveal';
import { DebugCameraTool, DebugLoadedSectorsTool, DebugLoadedSectorsToolOptions, AxisViewTool, GeomapTool, MapConfig,
  MapboxMode, MapboxStyle, MapProviders, MapboxImageFormat, BingMapType, HereMapType, HereMapScheme, HereMapImageFormat } from '@cognite/reveal/tools';
import * as reveal from '@cognite/reveal';

window.THREE = THREE;
(window as any).reveal = reveal;

export function Geomap() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const gui = new dat.GUI({ width: Math.min(500, 0.8*window.innerWidth) });
    let viewer: Cognite3DViewer;

    function createGeometryFilter(input: string | null): { center: THREE.Vector3, size: THREE.Vector3 } | undefined  {
      if (input === null) return undefined;
      const parsed = JSON.parse(input) as { center: THREE.Vector3, size: THREE.Vector3 };
      return { center: new THREE.Vector3().copy(parsed.center), size: new THREE.Vector3().copy(parsed.size) };
    }

    async function main() {
      const url = new URL(window.location.href);
      const urlParams = url.searchParams;
      const project = urlParams.get('project');
      const geometryFilterInput = urlParams.get('geometryFilter');
      const environmentParam = urlParams.get('env');
      const geometryFilter = createGeometryFilter(geometryFilterInput);
      if (!project) {
        throw new Error('Must provide "project"as URL parameter');
      }

      const totalBounds = new THREE.Box3();

      const pointCloudParams = {
        pointSize: 1.0,
        budget: 2_000_000,
        pointColorType: PotreePointColorType.Rgb,
        pointShape: PotreePointShape.Circle,
        apply: () => {
          pointCloudModels.forEach(model => {
            model.pointSize = pointCloudParams.pointSize;
            model.pointColorType = pointCloudParams.pointColorType;
            model.pointShape = pointCloudParams.pointShape;
            console.log(model.pointColorType, model.pointShape);
          });
        }
      };

      let client;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.geomap', project, environmentParam);
      } else {
        client = new CogniteClient({ appId: 'reveal.example.geomap',
                                     project: 'dummy',
                                     getToken: async () => 'dummy' });
      }

      const progress = (itemsLoaded: number, itemsRequested: number, itemsCulled: number) => {
        guiState.debug.loadedSectors.statistics.culledCount = itemsCulled;
        console.log(`loaded ${itemsLoaded}/${itemsRequested} (culled: ${itemsCulled})`);

      };
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

          viewer.loadCameraFromModel(model);
          if (model instanceof Cognite3DModel) {
            cadModels.push(model);
          } else if (model instanceof CognitePointCloudModel) {
            pointCloudModels.push(model);
            pointCloudParams.apply();
          }
          if (createGeometryFilterFromState(guiState.geometryFilter) === undefined) {
            createGeometryFilterStateFromBounds(bounds, guiState.geometryFilter);
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
        geometryFilter:
          geometryFilter !== undefined
          ? { ...geometryFilter, enabled: true }
          : { center: new THREE.Vector3(), size: new THREE.Vector3(), enabled: false },
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
        providers: 'MapboxMap',
        latitude: 0.000001,
        longitude: 0.000001
      };

      // Load model if provided by URL
      const modelIdStr = urlParams.get('modelId');
      const revisionIdStr = urlParams.get('revisionId');
      if (modelIdStr && revisionIdStr) {
        const modelId = Number.parseInt(modelIdStr, 10);
        const revisionId = Number.parseInt(revisionIdStr, 10);
        await addModel({ modelId, revisionId, geometryFilter: createGeometryFilterFromState(guiState.geometryFilter) });
      }

      const selectedSet = new TreeIndexNodeCollection([]);

      new AxisViewTool(viewer);
      viewer.on('click', async event => {
        const { offsetX, offsetY } = event;
        console.log('2D coordinates', event);
        const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
        if (intersection !== null) {
          console.log(intersection);
          switch (intersection.type) {
            case 'cad':
            {
              const { treeIndex, point, model } = intersection;
              console.log(`Clicked node with treeIndex ${treeIndex} at`, point);
              // highlight the object
              selectedSet.updateSet(new IndexSet([treeIndex]));
              const boundingBox = await model.getBoundingBoxByTreeIndex(treeIndex);
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

      let mapConfig: MapConfig = {
        provider: MapProviders.MapboxMap,
        APIKey: "pk.eyJ1IjoicHJhbW9kLXMiLCJhIjoiY2tzb2JkbXdyMGd5cjJubnBrM3IwMTd0OCJ9.jA9US2D2FRXUlldhE8bZgA",
        mode: MapboxMode.Style,
        id: MapboxStyle.Satellite_Streets,
        tileFormat: MapboxImageFormat.JPG70,
        latlong: {
          latitude: 59.9016426931744,
          longitude: 10.607235872426175
        }
      };
      let map = new GeomapTool(viewer, mapConfig);

      const renderGui = gui.addFolder('Options');
      const mapProviders = ['MapboxMap', 'HereMap', 'BingMap', 'OpenStreetMap'];
      renderGui.add(guiState, 'providers', mapProviders).name('MapProviders').onFinishChange(value => {
        switch(value) {
          case 'HereMap':
            mapConfig = {
              provider: MapProviders.HereMap,
              APIKey: "HqSchC7XT2PA9qCfxzFq",
              appCode: "5rob9QcZ70J-m18Er8-rIA",
              style: HereMapType.Aerial,
              scheme: HereMapScheme.Terrain,
              imageFormat: HereMapImageFormat.PNG,
              latlong: {
                  latitude: 59.9016426931744,
                  longitude: 10.607235872426175
              }
            };
            break;
          case 'MapboxMap':
            mapConfig = {
              provider: MapProviders.MapboxMap,
              APIKey: "pk.eyJ1IjoicHJhbW9kLXMiLCJhIjoiY2tzb2JkbXdyMGd5cjJubnBrM3IwMTd0OCJ9.jA9US2D2FRXUlldhE8bZgA",
              mode: MapboxMode.Style,
              id: MapboxStyle.Satellite_Streets,
              tileFormat: MapboxImageFormat.JPG70,
              latlong: {
                latitude: 59.9016426931744,
                longitude: 10.607235872426175
              }
            };
            break;
          case 'BingMap':
            mapConfig = {
              provider: MapProviders.BingMap,
              APIKey: "AuViYD_FXGfc3dxc0pNa8ZEJxyZyPq1lwOLPCOydV3f0tlEVH-HKMgxZ9ilcRj-T",
              type: BingMapType.Aerial,
              latlong: {
                  latitude: 59.9016426931744,
                  longitude: 10.607235872426175
              }
            };
            break;
          case 'OpenStreetMap':
            mapConfig = {
              provider: MapProviders.OpenStreetMap,
              latlong: {
                  latitude: 59.9016426931744,
                  longitude: 10.607235872426175
              }
            };
            break;
        }
        map.dispose();
        map = new GeomapTool(viewer, mapConfig);
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

function createGeometryFilterStateFromBounds(bounds: THREE.Box3, out: { center: THREE.Vector3, size: THREE.Vector3 }) {
  bounds.getCenter(out.center);
  bounds.getSize(out.size);
  return out;
}

function createGeometryFilterFromState(state: { center: THREE.Vector3, size: THREE.Vector3 }):
 { boundingBox: THREE.Box3, isBoundingBoxInModelCoordinates: true } | undefined {
  state.size.clamp(new THREE.Vector3(0,0,0), new THREE.Vector3(Infinity, Infinity, Infinity));
  if (state.size.equals(new THREE.Vector3())) {
    return undefined;
  }
  return { boundingBox: new THREE.Box3().setFromCenterAndSize(state.center, state.size), isBoundingBoxInModelCoordinates: true };
}
