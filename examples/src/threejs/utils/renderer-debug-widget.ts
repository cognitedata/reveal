/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
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

export type RenderOptions = {
  suspendLoading: boolean;
  renderMode: RenderMode;
  renderFilter: RenderFilter;
};

export function createDefaultRenderOptions() {
  return {
    suspendLoading: false,
    renderMode: RenderMode.WhenNecessary,
    renderFilter: everythingRenderFilter
  };
}

function createEmptySceneInfo() {
  return {
    sectors: {
      count: 0,
      withMeshesCount: 0
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
  renderer: THREE.WebGLRenderer,
  scene: THREE.Object3D,
  parentGui?: dat.GUI,
  intervalMs: number = 100
): RenderOptions {
  const gui = parentGui || new dat.GUI();
  const renderInfo = renderer.info;

  const sceneInfo = createEmptySceneInfo();
  const renderOptions = createDefaultRenderOptions();

  const functions = {
    logVisible: () => {
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
    },
    logMaterials: () => {
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
    },
    initializeThreeJSInspector: () => {
      (window as any).THREE = THREE;
      (window as any).scene = scene;
      (window as any).renderer = renderer;
      // tslint:disable-next-line: no-console
      console.log('Set window.scene, window.renderer and window.THREE');
      // tslint:disable-next-line: no-console
      console.log(
        'See https://github.com/jeromeetienne/threejs-inspector/blob/master/README.md for details on the ThreeJS inspector'
      );
    }
  };

  const controls: dat.GUIController[] = []; // List of controls that must be manually updated

  const renderModes = [RenderMode.WhenNecessary, RenderMode.AlwaysRender, RenderMode.DisableRendering];
  gui.add(renderOptions, 'suspendLoading').name('Suspend loading');
  gui.add(renderOptions, 'renderMode', renderModes).name('Render mode');

  // Basic render performance
  controls.push(gui.add(sceneInfo, 'fps').name('FPS'));
  controls.push(gui.add(renderInfo.render, 'calls').name('Draw calls'));
  controls.push(gui.add(renderInfo.render, 'triangles').name('Triangles'));
  controls.push(gui.add(renderInfo.programs || [], 'length').name('Shaders'));
  controls.push(gui.add(sceneInfo, 'distinctMaterialCount').name('Materials'));

  // Actions
  gui.add(functions, 'logVisible').name('Log visible meshes');
  gui.add(functions, 'initializeThreeJSInspector').name('Init ThreeJS inspector');
  gui.add(functions, 'logMaterials').name('Print materials');

  // Render filtering
  const filterGui = gui.addFolder('Filtering');
  filterGui.add(renderOptions.renderFilter, 'renderInstancedMeshes').name('Instanced meshes');
  filterGui.add(renderOptions.renderFilter, 'renderPrimitives').name('Primitives');
  filterGui.add(renderOptions.renderFilter, 'renderTriangleMeshes').name('Triangle meshes');
  filterGui.add(renderOptions.renderFilter, 'renderQuads').name('Quads');

  // Details about different geometries
  const sectorsGui = gui.addFolder('Sectors');
  controls.push(sectorsGui.add(sceneInfo.sectors, 'count').name('Total'));
  controls.push(sectorsGui.add(sceneInfo.sectors, 'withMeshesCount').name('With mesh(es)'));
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

  setInterval(() => {
    computeFramesPerSecond(renderer, sceneInfo);
    updateSceneInfo(scene, sceneInfo);
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

function updateSceneInfo(scene: THREE.Object3D, sceneInfo: SceneInfo) {
  sceneInfo.sectors.count = 0;
  sceneInfo.sectors.withMeshesCount = 0;
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
    if (x.visible && x.name.startsWith('Sector')) {
      sceneInfo.sectors.count++;
      sceneInfo.sectors.withMeshesCount += x.children.find(y => y.type === 'Mesh') ? 1 : 0;
    } else if (x.type !== 'Mesh') {
      return;
    }
    const mesh = x as THREE.Mesh;
    const geometry = mesh.geometry as THREE.BufferGeometry;

    const materials = getMaterials(mesh);
    materials.forEach(m => materialIds.add(m.id));

    if (x.name.startsWith('Primitives')) {
      sceneInfo.primitives.meshCount++;
      sceneInfo.primitives.templateTriangleCount += geometry.index.count / 3;
      sceneInfo.primitives.instanceCount += geometry.attributes.a_treeIndex.count;
    } else if (x.name.startsWith('Triangle mesh')) {
      sceneInfo.triangleMeshes.meshCount++;
      sceneInfo.triangleMeshes.triangleCount += geometry.index.count / 3;
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
