/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import * as reveal_threejs from '@cognite/reveal/threejs';
import dat from 'dat.gui';

export type RenderFilter = {
  renderQuads: boolean;
  renderPrimitives: boolean;
  renderTriangleMeshes: boolean;
  renderInstancedMeshes: boolean;
};
const everythingRenderFilter: RenderFilter = {
  renderQuads: true,
  renderPrimitives: true,
  renderTriangleMeshes: true,
  renderInstancedMeshes: true
};

export enum RenderMode {
  WhenNecessary = 'WhenNecessary',
  DisableRendering = 'DisableRendering',
  AlwaysRender = 'AlwaysRender'
}

export enum SectorLevelOfDetail {
  High,
  Low
}

export type RenderOptions = {
  loadingEnabled: boolean;
  renderMode: RenderMode;
  renderFilter: RenderFilter;
  overrideWantedSectors?: reveal.internal.WantedSector[];
};

export function createDefaultRenderOptions(): RenderOptions {
  return {
    loadingEnabled: true,
    renderMode: RenderMode.WhenNecessary,
    renderFilter: everythingRenderFilter,
    overrideWantedSectors: undefined
  };
}

function createEmptySceneInfo() {
  return {
    sectors: {
      count: 0,
      loadedDetailedCount: 0
    },
    primitives: {
      meshCount: 0,
      instanceCount: 0,
      templateTriangleCount: 0
    },
    triangleMeshes: {
      meshCount: 0,
      triangleCount: 0
    },
    instanceMeshes: {
      meshCount: 0,
      instanceCount: 0,
      avgInstancesPerMesh: 0.0,
      templateTriangleCount: 0
    },
    quads: {
      meshCount: 0,
      quadCount: 0,
      templateTriangleCount: 0
    },
    distinctMaterialCount: 0,
    // Stuff to compute FPS
    lastUpdate: {
      timestamp: Date.now(),
      frame: 0
    },
    fps: 0
  };
}
type SceneInfo = ReturnType<typeof createEmptySceneInfo>;

export function createRendererDebugWidget(
  sectorMetadataRoot: reveal.SectorMetadata,
  renderer: THREE.WebGLRenderer,
  cadNode: reveal_threejs.CadNode,
  gui: dat.GUI,
  intervalMs: number = 100
): RenderOptions {
  const renderInfo = renderer.info;
  const sceneInfo = createEmptySceneInfo();
  const renderOptions = createDefaultRenderOptions();

  const controls: dat.GUIController[] = []; // List of controls that must be manually updated

  const renderModes = [RenderMode.WhenNecessary, RenderMode.AlwaysRender, RenderMode.DisableRendering];
  const renderStyleOptions = { showBoundingBoxes: false };
  gui.add(renderOptions, 'loadingEnabled').name('Loading enabled');
  gui.add(renderOptions, 'renderMode', renderModes).name('Render mode');
  gui
    .add(renderStyleOptions, 'showBoundingBoxes')
    .name('Show bounding boxes')
    .onChange(() => {
      cadNode.renderHints = Object.assign(cadNode.renderHints || {}, {
        showSectorBoundingBoxes: renderStyleOptions.showBoundingBoxes
      });
    });

  // Basic render performance
  const statsGui = gui.addFolder('Stats');
  controls.push(statsGui.add(sceneInfo, 'fps').name('FPS'));
  controls.push(statsGui.add(renderInfo.render, 'calls').name('Draw calls'));
  controls.push(statsGui.add(renderInfo.render, 'triangles').name('Triangles'));
  controls.push(statsGui.add(renderInfo.programs || [], 'length').name('Shaders'));
  controls.push(statsGui.add(sceneInfo, 'distinctMaterialCount').name('Materials'));
  statsGui.open();

  // Render filtering
  const filterGui = gui.addFolder('Filtering');
  filterGui.add(renderOptions.renderFilter, 'renderInstancedMeshes').name('Instanced meshes');
  filterGui.add(renderOptions.renderFilter, 'renderPrimitives').name('Primitives');
  filterGui.add(renderOptions.renderFilter, 'renderTriangleMeshes').name('Triangle meshes');
  filterGui.add(renderOptions.renderFilter, 'renderQuads').name('Quads');

  // Sectors
  const sectorsGui = gui.addFolder('Sectors');
  controls.push(sectorsGui.add(sceneInfo.sectors, 'count').name('Total'));
  controls.push(sectorsGui.add(sceneInfo.sectors, 'loadedDetailedCount').name('Loaded detailed'));
  controls.push(sectorsGui.add(sceneInfo.quads, 'meshCount').name('Loaded quads'));

  // Sectors to load
  const loadOverrideGui = sectorsGui.addFolder('Override loading');
  const loadOverride = { maxQuadSize: 0.0025, quadsFilter: '', detailedFilter: '' };
  const updateWantedNodesFilter = () =>
    updateWantedSectorOverride(
      renderOptions,
      sectorMetadataRoot,
      loadOverride.quadsFilter,
      loadOverride.detailedFilter
    );
  const budget = {
    maxDownloadSize: cadNode.budget.maxDownloadSize || -1,
    maxDrawCount: cadNode.budget.maxDrawCount || -1
  };
  loadOverrideGui
    .add(budget, 'maxDrawCount', -1, 10000)
    .name('Max draw count')
    .onFinishChange(() => {
      cadNode.budget.maxDrawCount = budget.maxDrawCount !== -1 ? budget.maxDrawCount : undefined;
    });
  loadOverrideGui
    .add(budget, 'maxDownloadSize', -1, 1000)
    .name('Max download size (MB)')
    .onFinishChange(() => {
      cadNode.budget.maxDownloadSize = budget.maxDownloadSize !== -1 ? budget.maxDownloadSize : undefined;
    });
  loadOverrideGui
    .add(loadOverride, 'maxQuadSize', 0, 0.05, 0.0001)
    .name('Max quad size %')
    .onFinishChange(() => {
      const override: reveal.CadLoadingHints = {
        maxQuadSize: loadOverride.maxQuadSize > 0.0 ? loadOverride.maxQuadSize : undefined
      };
      cadNode.loadingHints = {
        ...cadNode.loadingHints,
        ...override
      };
    });
  loadOverrideGui
    .add(loadOverride, 'quadsFilter')
    .name('Quads (low detail)')
    .onFinishChange(updateWantedNodesFilter);
  loadOverrideGui
    .add(loadOverride, 'detailedFilter')
    .name('Detailed')
    .onFinishChange(updateWantedNodesFilter);

  // Details about different geometries
  const primitivesGui = gui.addFolder('Primitives');
  controls.push(primitivesGui.add(sceneInfo.primitives, 'meshCount').name('Mesh count'));
  controls.push(primitivesGui.add(sceneInfo.primitives, 'instanceCount').name('Instance count'));
  controls.push(primitivesGui.add(sceneInfo.primitives, 'templateTriangleCount').name('Triangles'));
  const instancesGui = gui.addFolder('Instances');
  controls.push(instancesGui.add(sceneInfo.instanceMeshes, 'meshCount').name('Mesh count'));
  controls.push(instancesGui.add(sceneInfo.instanceMeshes, 'instanceCount').name('Instance count'));
  controls.push(instancesGui.add(sceneInfo.instanceMeshes, 'templateTriangleCount').name('Triangles'));
  controls.push(instancesGui.add(sceneInfo.instanceMeshes, 'avgInstancesPerMesh').name('Avg instances per mesh'));
  const meshesGui = gui.addFolder('Meshes');
  controls.push(meshesGui.add(sceneInfo.triangleMeshes, 'meshCount').name('Mesh count'));
  controls.push(meshesGui.add(sceneInfo.triangleMeshes, 'triangleCount').name('Triangles'));

  const quadsGui = gui.addFolder('Quads (low detail geometry)');
  controls.push(quadsGui.add(sceneInfo.quads, 'meshCount').name('Mesh count'));
  controls.push(quadsGui.add(sceneInfo.quads, 'quadCount').name('Quad count'));

  // Actions
  const actions = {
    logVisible: () => logVisibleSectorsInScene(cadNode),
    logActiveSectors: () => logActiveSectors(cadNode),
    logMaterials: () => logActiveMaterialsInScene(cadNode),
    saveWindowVariables: () => saveWindowVariables(renderer, cadNode, sectorMetadataRoot)
  };
  const actionsGui = gui.addFolder('Actions');
  actionsGui.add(actions, 'logVisible').name('Log visible meshes');
  actionsGui.add(actions, 'logActiveSectors').name('Log active sectors');
  actionsGui.add(actions, 'saveWindowVariables').name('Save global variables');
  actionsGui.add(actions, 'logMaterials').name('Print materials');

  // Regularly update displays
  setInterval(() => {
    computeFramesPerSecond(renderer, sceneInfo);
    updateSceneInfo(cadNode, sceneInfo);
    controls.forEach(ctrl => ctrl.updateDisplay());
  }, intervalMs);

  return renderOptions;
}

function computeFramesPerSecond(renderer: THREE.WebGLRenderer, sceneInfo: SceneInfo) {
  const timestamp = Date.now();
  const currentFrame = renderer.info.render.frame;

  const dts = (timestamp - sceneInfo.lastUpdate.timestamp) / 1000;
  const dFrames = currentFrame - sceneInfo.lastUpdate.frame;
  // FPS over time
  sceneInfo.fps = 0.3 * (dFrames / dts) + 0.7 * sceneInfo.fps;
  sceneInfo.lastUpdate.frame = currentFrame;
  sceneInfo.lastUpdate.timestamp = timestamp;
}

function isSectorRoot(object: THREE.Object3D): boolean {
  return object.name.startsWith('Sector');
}

function isHighDetailSectorRoot(object: THREE.Object3D): boolean {
  return (
    // Container for a sector
    isSectorRoot(object) &&
    !!object.children.find(
      // Container has a group
      y =>
        y.type === 'Group' &&
        // The group contains mesh that isn't quad
        y.children.find(z => z.type === 'Mesh' && !z.name.startsWith('Quads'))
    )
  );
}

function updateSceneInfo(scene: THREE.Object3D, sceneInfo: SceneInfo) {
  sceneInfo.sectors.count = 0;
  sceneInfo.sectors.loadedDetailedCount = 0;
  sceneInfo.primitives.meshCount = 0;
  sceneInfo.primitives.templateTriangleCount = 0;
  sceneInfo.primitives.instanceCount = 0;
  sceneInfo.instanceMeshes.meshCount = 0;
  sceneInfo.instanceMeshes.templateTriangleCount = 0;
  sceneInfo.instanceMeshes.instanceCount = 0;
  sceneInfo.instanceMeshes.avgInstancesPerMesh = 0.0;
  sceneInfo.triangleMeshes.meshCount = 0;
  sceneInfo.triangleMeshes.triangleCount = 0;
  sceneInfo.quads.meshCount = 0;
  sceneInfo.quads.quadCount = 0;

  const materialIds = new Set<number>();
  scene.traverseVisible(x => {
    if (isSectorRoot(x)) {
      sceneInfo.sectors.count++;
      sceneInfo.sectors.loadedDetailedCount += isHighDetailSectorRoot(x) ? 1 : 0;
    }

    if (x.type !== 'Mesh') {
      return;
    }
    const mesh = x as THREE.Mesh;
    const geometry = mesh.geometry as THREE.BufferGeometry;

    const materials = getMaterials(mesh);
    materials.forEach(m => materialIds.add(m.id));

    if (x.name.startsWith('Primitives')) {
      const indexAttribute = geometry.index!;
      sceneInfo.primitives.meshCount++;
      sceneInfo.primitives.templateTriangleCount += indexAttribute.count / 3;
      sceneInfo.primitives.instanceCount += geometry.attributes.a_treeIndex.count;
    } else if (x.name.startsWith('Triangle mesh')) {
      const indexAttribute = geometry.index!;
      sceneInfo.triangleMeshes.meshCount++;
      sceneInfo.triangleMeshes.triangleCount += indexAttribute.count / 3;
    } else if (x.name.startsWith('Instanced mesh')) {
      sceneInfo.instanceMeshes.meshCount++;
      sceneInfo.instanceMeshes.templateTriangleCount += geometry.drawRange.count;
      sceneInfo.instanceMeshes.instanceCount += geometry.attributes.a_treeIndex.count;
    } else if (x.name.startsWith('Quads')) {
      sceneInfo.quads.meshCount++;
      sceneInfo.quads.quadCount += geometry.attributes.color.count;
    }
  });

  sceneInfo.distinctMaterialCount = materialIds.size;
  sceneInfo.instanceMeshes.avgInstancesPerMesh =
    sceneInfo.instanceMeshes.instanceCount / sceneInfo.instanceMeshes.meshCount;
}

/**
 * Apply filters from a RenderFilter created using createRendererDebugWidget.
 * This must be called every frame in order to ensure scene is updated correctly.
 * @param scene
 * @param filter
 */
export function applyRenderingFilters(scene: THREE.Scene, filter: RenderFilter) {
  scene.traverse(x => {
    if (x.name.startsWith('Primitives')) {
      x.visible = filter.renderPrimitives;
    } else if (x.name.startsWith('Triangle mesh')) {
      x.visible = filter.renderTriangleMeshes;
    } else if (x.name.startsWith('Instanced mesh')) {
      x.visible = filter.renderInstancedMeshes;
    } else if (x.name.startsWith('Quads')) {
      x.visible = filter.renderQuads;
    }
  });
}

function getMaterials(mesh: THREE.Mesh): THREE.Material[] {
  if (!mesh.material) {
    return [];
  } else if (Array.isArray(mesh.material)) {
    return mesh.material;
  } else {
    return [mesh.material as THREE.Material];
  }
}

/**
 * From the provided filter, returns a set of nodeIds accepted by the filter.
 * @param filter Comma-separated list of regular expressions, matched with the sector-tree paths (on
 *               format x/y/z/ where x,y,z is a number).
 * @param root   The root of the sector tree.
 */
function filterSectorNodes(filter: string, root: reveal.SectorMetadata): reveal.SectorMetadata[] {
  const acceptedNodes: reveal.SectorMetadata[] = [];
  for (let pathRegex of filter.split('|').map(x => x.trim())) {
    if (!pathRegex.startsWith('^')) {
      pathRegex = '^' + pathRegex;
    }
    if (!pathRegex.endsWith('$')) {
      pathRegex = pathRegex + '$';
    }
    reveal.internal.traverseDepthFirst(root, node => {
      if (node.path.match(pathRegex)) {
        acceptedNodes.push(node);
      }
      return true;
    });
  }
  return acceptedNodes;
}

function updateWantedSectorOverride(
  renderOptions: RenderOptions,
  root: reveal.SectorMetadata,
  quadsFilter: string,
  detailedFilter: string
) {
  if (quadsFilter === '' && detailedFilter === '') {
    renderOptions.overrideWantedSectors = undefined;
  } else {
    const acceptedSimple = filterSectorNodes(quadsFilter, root);
    const acceptedDetailed = filterSectorNodes(detailedFilter, root);
    const wanted: reveal.internal.WantedSector[] = [];
    for (const node of acceptedSimple) {
      wanted.push({
        id: node.id,
        levelOfDetail: reveal.internal.LevelOfDetail.Simple,
        metadata: node
      });
    }
    for (const node of acceptedDetailed) {
      wanted.push({
        id: node.id,
        levelOfDetail: reveal.internal.LevelOfDetail.Detailed,
        metadata: node
      });
    }
    renderOptions.overrideWantedSectors = wanted;
  }
}

function logVisibleSectorsInScene(scene: THREE.Object3D) {
  const visibleMeshes: Record<string, THREE.Mesh> = {};
  scene.traverseVisible(x => {
    if (x.type === 'Mesh' || x.type === 'LOD') {
      let path = '';
      x.traverseAncestors(y => {
        path = y.name + '/' + path;
      });
      visibleMeshes[path + x.name] = x as THREE.Mesh;
    }
  });
  // tslint:disable-next-line: no-console
  console.log('Visible meshes:', visibleMeshes);
}

function logActiveMaterialsInScene(scene: THREE.Object3D) {
  const uniqueMaterials: Record<number, THREE.Material> = {};
  scene.traverseVisible(x => {
    if (x.type === 'Mesh') {
      const mesh = x as THREE.Mesh;
      const materials = getMaterials(mesh);
      materials.forEach(m => (uniqueMaterials[m.id] = m));
    }
  });
  // tslint:disable-next-line: no-console
  console.log('Unique materials:', uniqueMaterials);
}

function logActiveSectors(scene: THREE.Object3D) {
  const activeDetailedRoots: THREE.Object3D[] = [];
  const activeQuadsRoots: THREE.Object3D[] = [];
  scene.traverseVisible(x => {
    if (x.name.startsWith('Sector') && x.children.find(y => y.type === 'Mesh')) {
      if (x.children.find(y => y.name.startsWith('Quads'))) {
        activeQuadsRoots.push(x);
      } else {
        activeDetailedRoots.push(x);
      }
    }
  });
  // tslint:disable-next-line: no-console
  console.log('Active detailed sectors:', activeDetailedRoots);
  // tslint:disable-next-line: no-console
  console.log('Active quads sectors:', activeQuadsRoots);
}

function saveWindowVariables(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Object3D,
  sectorMetadataRoot: reveal.SectorMetadata
) {
  (window as any).THREE = THREE;
  (window as any).scene = scene;
  (window as any).renderer = renderer;
  (window as any).sectorRoot = sectorMetadataRoot;
  // tslint:disable-next-line: no-console
  console.log('Set window.scene, window.renderer, window.THREE and window.sectorRoot');
  // tslint:disable-next-line: no-console
  console.log(
    'See https://github.com/jeromeetienne/threejs-inspector/blob/master/README.md for details on the ThreeJS inspector'
  );
}
