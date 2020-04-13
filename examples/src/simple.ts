/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal_threejs from '@cognite/reveal/threejs';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams, createClientIfNecessary } from './utils/loaders';
import { OrderSectorsByVisibleCoverage } from '@cognite/reveal/threejs';
import * as reveal from '@cognite/reveal';
import { vec3 } from 'gl-matrix';
import { Sector } from '@cognite/reveal/models/cad/types';

CameraControls.install({ THREE });

type PrioritizedWantedSector = reveal.internal.WantedSector & { priority: number };

class GpuBasedSectorCuller implements reveal.internal.SectorCuller {
  public readonly coverageUtil: OrderSectorsByVisibleCoverage;
  private readonly camera: THREE.Camera;
  private readonly models: reveal.CadModel[] = [];

  private determineLevelofDetailPreallocatedVars = {
    bbox: new THREE.Box3(),
    min: new THREE.Vector3(),
    max: new THREE.Vector3(),
    cameraPosition: new THREE.Vector3()
  };

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

    const costLimit = 150 * 1024 * 1024;
    let costSpent = 0.0;

    const wanted: (reveal.internal.WantedSector & { priority: number })[] = [];
    const wantedSimpleSectors = new Set<[reveal.CadModel, number]>();
    const takenSectors = new Set<[reveal.CadModel, number]>();

    // Add high details for all sectors the camera is inside
    costSpent += this.addHighDetailsForInsideSectors(input.cameraPosition, takenSectors, wanted);

    // Create a list of parents that are required for each entry of the prioritized list
    let debugAccumulatedPriority = 0.0;
    const prioritizedLength = prioritized.length;
    // Holds IDs of wanted simple sectors. No children of these should be loaded.
    for (let i = 0; i < prioritizedLength && costSpent < costLimit; i++) {
      const x = prioritized[i];
      const metadata = x.model.scene.getSectorById(x.sectorId);
      const levelOfDetail = this.determineLevelOfDetail(input, metadata!);
      debugAccumulatedPriority += x.priority;
      if (levelOfDetail === reveal.internal.LevelOfDetail.Detailed) {
        costSpent += this.addDetailed(x, metadata, wanted, wantedSimpleSectors, takenSectors);
      } else if (levelOfDetail === reveal.internal.LevelOfDetail.Simple) {
        costSpent += this.addSimpleSector(x, metadata!, wanted, wantedSimpleSectors);
      } else {
        throw new Error(`Unexpected levelOfDetail ${levelOfDetail}`);
      }
    }

    // TODO 2020-04-05 larsmoa: Add low detail sectors when budget runs out
    // console.log(
    //   `${wanted
    //     .map(x => {
    //       const { xy, xz, yz } = x.metadata.facesFile.coverageFactors;
    //       return `${x.metadata.path}[${x.levelOfDetail.toString()}] (cov: ${(xy + xz + yz) / 3.0}, pri: ${x.priority})`;
    //     })
    //     .sort()
    //     .join('\n')}\nTotal: ${wanted.length} (cost: ${costSpent / 1024 / 1024}, priority: ${debugAccumulatedPriority})`
    // );
    console.log(`Total: ${wanted.length} (cost: ${costSpent / 1024 / 1024}, priority: ${debugAccumulatedPriority}`);
    return wanted;
  }

  private addHighDetailsForInsideSectors(
    cameraPosition: vec3,
    takenSectors: Set<[reveal.CadModel, number]>,
    wanted: PrioritizedWantedSector[]
  ): number {
    let costSpent = 0.0;
    this.models.forEach(model => {
      for (const sector of model.scene.getSectorsContainingPoint(cameraPosition)) {
        costSpent += this.computeSectorCost(sector);
        takenSectors.add([model, sector.id]);
        wanted.push({
          id: sector.id,
          metadata: sector,
          levelOfDetail: reveal.internal.LevelOfDetail.Detailed,
          priority: Infinity
        });
      }
    });
    return costSpent;
  }

  private addSimpleSector(
    sector: reveal_threejs.PrioritizedSectorIdentifier,
    metadata: reveal.SectorMetadata,
    wanted: PrioritizedWantedSector[],
    wantedSimpleSectors: Set<[reveal.CadModel, number]>
  ): number {
    // Simple detail
    wantedSimpleSectors.add([sector.model, sector.sectorId]);
    wanted.push({
      id: sector.sectorId,
      metadata: metadata!,
      levelOfDetail: reveal.internal.LevelOfDetail.Simple,
      priority: sector.priority
    });

    return this.computeSectorCost(metadata!);
  }

  private addDetailed(
    sector: reveal_threejs.PrioritizedSectorIdentifier,
    metadata: reveal.SectorMetadata | undefined,
    wanted: PrioritizedWantedSector[],
    wantedSimpleSectors: Set<[reveal.CadModel, number]>,
    takenSectors: Set<[reveal.CadModel, number]>
  ): number {
    // Find parents and "total cost" of sector
    const required: reveal.SectorMetadata[] = [];
    let totalCost = 0;
    // TODO 2020-04-12 larsmoa: Not sure if adding parents is a good idea
    while (metadata && !takenSectors.has([sector.model, metadata.id])) {
      if (wantedSimpleSectors.has([sector.model, metadata.id])) {
        console.log(`Skipped ${sector.sectorId} because ${metadata.path} is loaded simple`);
        break;
      }
      totalCost += this.computeSectorCost(metadata);
      takenSectors.add([sector.model, metadata.id]);
      required.push(metadata);
      metadata = metadata.parent;
    }

    // Add "order"
    const offset = wanted.length;
    wanted.length = wanted.length + required.length;
    for (let i = 0; i < required.length; i++) {
      wanted[offset + i] = {
        id: required[i].id,
        metadata: required[i],
        levelOfDetail: reveal.internal.LevelOfDetail.Detailed,
        priority: sector.priority
      };
    }
    return totalCost;
  }

  private determineLevelOfDetail(
    input: reveal.internal.DetermineSectorsByProximityInput,
    sector: reveal.SectorMetadata
  ): reveal.internal.LevelOfDetail {
    const { bbox, min, max, cameraPosition } = this.determineLevelofDetailPreallocatedVars;

    function distanceToCamera(s: reveal.SectorMetadata) {
      min.set(s.bounds.min[0], s.bounds.min[1], s.bounds.min[2]);
      max.set(s.bounds.max[0], s.bounds.max[1], s.bounds.max[2]);
      bbox.makeEmpty();
      bbox.expandByPoint(min);
      bbox.expandByPoint(max);
      cameraPosition.set(input.cameraPosition[0], input.cameraPosition[1], input.cameraPosition[2]);
      return bbox.distanceToPoint(cameraPosition);
    }

    const maxQuadSize = 0.012;
    const degToRadFactor = Math.PI / 180;
    const screenHeight = 2.0 * distanceToCamera(sector) * Math.tan((input.cameraFov / 2) * degToRadFactor);
    const largestAllowedQuadSize = maxQuadSize * screenHeight; // no larger than x percent of the height
    const quadSize = sector.facesFile.quadSize;
    if (quadSize < largestAllowedQuadSize && sector.facesFile.fileName) {
      // TODO 2020-04-10 larsmoa: Handle missing simple geometry better
      return reveal.internal.LevelOfDetail.Simple;
    } else if (quadSize < largestAllowedQuadSize) {
      // No faces file for sector, just ignore it (missing faces files are usually due to very little geometry)
      return reveal.internal.LevelOfDetail.Discarded;
    }
    return reveal.internal.LevelOfDetail.Detailed;
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
  const canvas = sectorCuller.coverageUtil.createDebugCanvas({ width: 640, height: 400 });
  canvas.style.position = 'fixed';
  canvas.style.left = '8px';
  canvas.style.top = '8px';
  document.body.appendChild(canvas);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  camera.near = near;
  camera.far = 3 * far;
  camera.fov = 75;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  document.addEventListener('keypress', event => {
    if (event.key === 's') {
      const suspendLoading = !cadNode.loadingHints.suspendLoading;
      console.log(`Suspend loading: ${suspendLoading}`);
      cadNode.loadingHints = { ...cadNode.loadingHints, suspendLoading };
    } else if (event.key === 'b') {
      const showSectorBoundingBoxes = !cadNode.renderHints.showSectorBoundingBoxes;
      console.log(`Show sector bounds: ${showSectorBoundingBoxes}`);
      cadNode.renderHints = { ...cadNode.renderHints, showSectorBoundingBoxes };
    }
  });

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
