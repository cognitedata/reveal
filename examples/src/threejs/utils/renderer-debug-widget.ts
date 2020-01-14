/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import dat from 'dat.gui';

export function createRendererDebugWidget(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  parentGui?: dat.GUI,
  intervalMs: number = 100
) {
  const gui = (parentGui || new dat.GUI()).addFolder('WebGL debug');
  const renderInfo = renderer.info;

  const sceneInfo = {
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
      templateTriangleCount: 0
    },
    quads: {
      meshCount: 0,
      quadCount: 0,
      templateTriangleCount: 0
    }
  };

  const controls: dat.GUIController[] = [];
  controls.push(gui.add(renderInfo.render, 'calls').name('Draw calls'));
  controls.push(gui.add(renderInfo.render, 'triangles').name('Triangles'));
  controls.push(gui.add(renderInfo.programs || [], 'length').name('Shaders'));
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
  const meshesGui = gui.addFolder('Meshes');
  controls.push(meshesGui.add(sceneInfo.triangleMeshes, 'meshCount').name('Mesh count'));
  controls.push(meshesGui.add(sceneInfo.triangleMeshes, 'triangleCount').name('Triangles'));
  const quadsGui = gui.addFolder('Quads (low detail geometry)');
  controls.push(quadsGui.add(sceneInfo.quads, 'meshCount').name('Mesh count'));
  controls.push(quadsGui.add(sceneInfo.quads, 'quadCount').name('Quad count'));

  setInterval(() => {
    sceneInfo.sectors.count = 0;
    sceneInfo.sectors.withMeshesCount = 0;
    sceneInfo.primitives.meshCount = 0;
    sceneInfo.primitives.templateTriangleCount = 0;
    sceneInfo.primitives.instanceCount = 0;
    sceneInfo.instanceMeshes.meshCount = 0;
    sceneInfo.instanceMeshes.templateTriangleCount = 0;
    sceneInfo.instanceMeshes.instanceCount = 0;
    sceneInfo.triangleMeshes.meshCount = 0;
    sceneInfo.triangleMeshes.triangleCount = 0;
    sceneInfo.quads.meshCount = 0;
    sceneInfo.quads.quadCount = 0;
    scene.traverse(x => {
      if (x.name.startsWith('Sector')) {
        sceneInfo.sectors.count++;
        sceneInfo.sectors.withMeshesCount += x.children.find(y => y.type === 'Mesh') ? 1 : 0;
      } else if (x.name.startsWith('Primitives')) {
        const mesh = x as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry;
        sceneInfo.primitives.meshCount++;
        sceneInfo.primitives.templateTriangleCount += geometry.index.count / 3;
        sceneInfo.primitives.instanceCount += geometry.attributes.a_treeIndex.count;
      } else if (x.name.startsWith('Triangle mesh')) {
        const mesh = x as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry;
        sceneInfo.triangleMeshes.meshCount++;
        sceneInfo.triangleMeshes.triangleCount += geometry.index.count / 3;
      } else if (x.name.startsWith('Instanced mesh')) {
        const mesh = x as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry;
        sceneInfo.instanceMeshes.meshCount++;
        sceneInfo.instanceMeshes.templateTriangleCount += geometry.drawRange.count;
        sceneInfo.instanceMeshes.instanceCount += geometry.attributes.a_color.count;
      } else if (x.name.startsWith('Quads')) {
        const mesh = x as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry;
        sceneInfo.quads.meshCount++;
        sceneInfo.quads.quadCount += geometry.attributes.color.count;
      }
    });

    controls.forEach(ctrl => ctrl.updateDisplay());
  }, intervalMs);
}
