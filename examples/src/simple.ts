/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal_threejs from '@cognite/reveal/threejs';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams, createClientIfNecessary } from './utils/loaders';
import { OrderSectorsByVisibleCoverage } from '@cognite/reveal/threejs';
import * as reveal from '@cognite/reveal';

CameraControls.install({ THREE });

class GpuBasedSectorCuller implements reveal.internal.SectorCuller {
  public readonly coverageUtil: OrderSectorsByVisibleCoverage;
  private readonly camera: THREE.Camera;
  private readonly models: reveal.CadModel[] = [];

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.coverageUtil = new OrderSectorsByVisibleCoverage();
  }

  addModel(cadModel: reveal.CadModel) {
    this.models.push(cadModel);
    this.coverageUtil.addModel(cadModel);
  }

  determineSectors(input: reveal.internal.DetermineSectorsByProximityInput): reveal.internal.WantedSector[] {
    if (this.models.length > 1) {
      throw new Error('Support for multiple models has not been implemented');
    }
    const prioritized = this.coverageUtil.prioritizeSectors(this.camera);
    console.log(prioritized);

    const costLimit = 45 * 1024 * 1024;
    let costSpent = 0.0;

    const wanted: reveal.internal.WantedSector[] = [];
    const takenSectors = new Set<number>();

    // Add high details for all sectors the camera is inside
    this.models.forEach(model => {
      for (const sector of model.scene.getSectorsContainingPoint(input.cameraPosition)) {
        costSpent += this.computeSectorCost(sector);
        takenSectors.add(sector.id);
        wanted.push({ id: sector.id, metadata: sector, levelOfDetail: reveal.internal.LevelOfDetail.Detailed });
      }
    });

    // Create a list of parents that are required for each entry of the prioritized list
    let debugAccumulatedPriority = 0.0;
    const prioritizedLength = prioritized.length;
    for (let i = 0; i < prioritizedLength && costSpent < costLimit; i++) {
      const x = prioritized[i];

      // Find parents and "total cost" of sector
      const required: reveal.SectorMetadata[] = [];
      let metadata = x.model.scene.getSectorById(x.sectorId);
      let totalCost = 0;
      while (metadata && !takenSectors.has(metadata.id)) {
        totalCost += this.computeSectorCost(metadata);
        required.push(metadata);
        metadata = metadata.parent;
      }

      // Add "order"
      debugAccumulatedPriority += x.priority;
      const batch = required.map(y => {
        return { id: y.id, metadata: y, levelOfDetail: reveal.internal.LevelOfDetail.Detailed };
      });
      wanted.push(...batch);

      // Update spendage
      costSpent += totalCost;
    }

    // TODO 2020-04-05 larsmoa: Add low detail sectors when budget runs out

    return wanted;
  }

  private computeSectorCost(metadata: reveal.SectorMetadata): number {
    return metadata.indexFile.downloadSize;
  }
}

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const modelIdentifier = createModelIdentifierFromUrlParams(urlParams, '/primitives');

  const camera = new THREE.PerspectiveCamera();
  const sectorCuller = new GpuBasedSectorCuller(camera);

  const scene = new THREE.Scene();
  const cadModel = await loadCadModelFromCdfOrUrl(modelIdentifier, await createClientIfNecessary(modelIdentifier));
  sectorCuller.addModel(cadModel);
  const cadNode = new reveal_threejs.CadNode(cadModel, { internal: { sectorCuller } });
  cadNode.renderHints = { showSectorBoundingBoxes: true };
  let sectorsNeedUpdate = true;
  cadNode.addEventListener('update', () => {
    sectorsNeedUpdate = true;
  });

  scene.add(cadNode);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Debug overlay for "determineSectors"
  const canvas = sectorCuller.coverageUtil.createDebugCanvas({ width: 320, height: 200 });
  canvas.style.position = 'fixed';
  canvas.style.left = '8px';
  canvas.style.top = '8px';
  document.body.appendChild(canvas);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  camera.near = near;
  camera.far = far;
  camera.fov = 75;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  cadNode.update(camera);
  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      cadNode.update(camera);
    }

    if (controlsNeedUpdate || sectorsNeedUpdate) {
      renderer.render(scene, camera);
      sectorsNeedUpdate = false;
    }

    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).renderer = renderer;
}

main();
