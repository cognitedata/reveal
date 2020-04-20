/*!
 * Copyright 2020 Cognite AS
 */

// Note! We introduce ThreeJS as a dependency here, but it's not exposed.
// If we add other rendering engines, we should consider to implement this in 'pure'
// WebGL.
import * as THREE from 'three';
import { vec3, mat4 } from 'gl-matrix';

import { WantedSector } from '../data/model/WantedSector';
import { LevelOfDetail } from '../data/model/LevelOfDetail';
import { SectorScene, SectorMetadata } from '../models/cad/types';
import { CadModel } from '../models/cad/CadModel';
import { DetermineSectorsByProximityInput } from '../models/cad/determineSectors';
import {
  GpuOrderSectorsByVisibleCoverage,
  PrioritizedSectorIdentifier,
  OrderSectorsByVisibleCoverage
} from '../views/threejs/OrderSectorsByVisibleCoverage';
import { SectorCuller } from './SectorCuller';
import { toThreeMatrix4, toThreeJsBox3, fromThreeMatrix } from '../views/threejs/utilities';
import { traverseDepthFirst } from '../utils/traversal';

type PrioritizedWantedSector = WantedSector & { priority: number; scene: SectorScene };

/**
 * Options for creating GpuBasedSectorCuller.
 */
export type ByVisibilityGpuSectorCullerOptions = {
  /**
   * Limit of how much data (measured in megabytes) to load for a given view point.
   */
  costLimitMb?: number;

  /**
   * Default maximum quad size used to determine level of detail. Note that this is overriden
   * by per-model loading hints if provided.
   */
  defaultMaxQuadSize?: number;

  /**
   * Sectors within this distance from the camera will always be loaded in high details.
   */
  highDetailProximityThreshold?: number;

  /**
   * Use a custom coverage utility to determine how "visible" each sector is.
   */
  coverageUtil?: OrderSectorsByVisibleCoverage;
};

/**
 * Experimental implementation of SectorCuller that uses the GPU to determine an approximatin
 * of how "visible" each sector is to get a priority for each sector.
 */
export class ByVisibilityGpuSectorCuller implements SectorCuller {
  public static readonly DefaultMaxQuadSize = 0.004;
  public static readonly DefaultCostLimitMb = 70;
  public static readonly DefaultHighDetailProximityThreshold = 10;

  private readonly options: Required<ByVisibilityGpuSectorCullerOptions>;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly models: CadModel[] = [];
  private readonly lastUpdate = {
    matrix: new THREE.Matrix4(),
    projectionMatrix: new THREE.Matrix4()
  };
  private prioritizedSectors: PrioritizedSectorIdentifier[] = [];

  constructor(camera: THREE.PerspectiveCamera, options?: ByVisibilityGpuSectorCullerOptions) {
    this.options = {
      costLimitMb:
        options && options.costLimitMb ? options.costLimitMb : ByVisibilityGpuSectorCuller.DefaultCostLimitMb,
      defaultMaxQuadSize:
        options && options.defaultMaxQuadSize
          ? options.defaultMaxQuadSize
          : ByVisibilityGpuSectorCuller.DefaultMaxQuadSize,
      highDetailProximityThreshold:
        options && options.highDetailProximityThreshold
          ? options.highDetailProximityThreshold
          : ByVisibilityGpuSectorCuller.DefaultHighDetailProximityThreshold,

      coverageUtil: options && options.coverageUtil ? options.coverageUtil : new GpuOrderSectorsByVisibleCoverage()
    };
    this.camera = camera;
  }

  addModel(cadModel: CadModel) {
    const { coverageUtil } = this.options;
    this.models.push(cadModel);
    coverageUtil.addModel(cadModel.scene, cadModel.modelTransformation);
  }

  determineSectors(input: DetermineSectorsByProximityInput): WantedSector[] {
    this.update();

    const costLimit = this.options.costLimitMb * 1024 * 1024;
    let costSpent = 0.0;

    const prioritized = this.prioritizedSectors;
    const wanted: (WantedSector & { priority: number; scene: SectorScene })[] = [];
    const wantedSimpleSectors = new Set<[SectorScene, number]>();
    const takenSectors = new Set<[SectorScene, number]>();

    // Add high details for all sectors the camera is inside or near
    const proximityThreshold = 10;
    costSpent += this.addHighDetailsForNearSectors(proximityThreshold, takenSectors, wanted);

    // Create a list of parents that are required for each entry of the prioritized list
    const reservedForSimple = 0.1; // 10% of budget is resevered for simple geometry

    let debugAccumulatedPriority = 0.0;
    const prioritizedLength = prioritized.length;
    // Holds IDs of wanted simple sectors. No children of these should be loaded.
    let i = 0;
    for (i = 0; i < prioritizedLength && costSpent < costLimit; i++) {
      const x = prioritized[i];
      const metadata = x.scene.getSectorById(x.sectorId);
      const levelOfDetail = this.determineLevelOfDetail(input, metadata!);
      debugAccumulatedPriority += x.priority;
      switch (levelOfDetail) {
        case LevelOfDetail.Detailed:
          if (costSpent < (1.0 - reservedForSimple) * costLimit) {
            costSpent += this.addDetailedSector(x, metadata, wanted, wantedSimpleSectors, takenSectors);
            break;
          }
          console.log(`Reverting to simple for ${metadata!.path}`);

        case LevelOfDetail.Simple:
          costSpent += this.addSimpleSector(x, metadata!, wanted, wantedSimpleSectors);
          break;

        default:
          throw new Error(`Unexpected levelOfDetail ${levelOfDetail}`);
      }
    }
    console.log(
      `Retrieving ${i} of ${prioritizedLength} (last: ${prioritized.length > 0 ? prioritized[i - 1] : null})`
    );

    const wantedForScene = wanted.filter(x => x.scene === input.sectorScene);
    console.log(
      `Scene: ${wantedForScene.length} (${
        wantedForScene.filter(x => !Number.isFinite(x.priority)).length
      } required), total: ${wanted.length} (cost: ${costSpent / 1024 / 1024}/${costLimit /
        1024 /
        1024}/, priority: ${debugAccumulatedPriority} (${
        wanted.filter(x => !Number.isFinite(x.priority)).length
      } required))`
    );
    return wantedForScene;
  }

  private update() {
    const { coverageUtil } = this.options;
    // Necessary to update?
    const changed =
      !this.lastUpdate.matrix.equals(this.camera.matrix) ||
      !this.lastUpdate.projectionMatrix.equals(this.camera.projectionMatrix);

    if (changed) {
      console.log('Update');
      this.prioritizedSectors = coverageUtil.orderSectorsByVisibility(this.camera);
      this.lastUpdate.matrix = this.camera.matrix.clone();
      this.lastUpdate.projectionMatrix = this.camera.projectionMatrix.clone();
    }
  }

  private addHighDetailsForNearSectors(
    proximityThreshold: number,
    takenSectors: Set<[SectorScene, number]>,
    wanted: PrioritizedWantedSector[]
  ): number {
    const shortRangeCamera = this.camera.clone(true);
    shortRangeCamera.far = proximityThreshold;
    shortRangeCamera.updateProjectionMatrix();
    const cameraMatrixWorldInverse = fromThreeMatrix(mat4.create(), shortRangeCamera.matrixWorldInverse);
    const cameraProjectionMatrix = fromThreeMatrix(mat4.create(), shortRangeCamera.projectionMatrix);

    let costSpent = 0.0;
    const transformedCameraMatrixWorldInverse = mat4.create();
    this.models.forEach(model => {
      // Apply model transformation to camera matrix
      mat4.multiply(
        transformedCameraMatrixWorldInverse,
        cameraMatrixWorldInverse,
        model.modelTransformation.modelMatrix
      );

      for (const sector of model.scene.getSectorsIntersectingFrustum(
        transformedCameraMatrixWorldInverse,
        cameraProjectionMatrix
      )) {
        console.log(sector);
        costSpent += this.computeSectorCost(sector);
        takenSectors.add([model.scene, sector.id]);
        wanted.push({
          sectorId: sector.id,
          metadata: sector,
          levelOfDetail: LevelOfDetail.Detailed,
          priority: Infinity,
          scene: model.scene
        });
      }
    });
    return costSpent;
  }

  private addSimpleSector(
    sector: PrioritizedSectorIdentifier,
    metadata: SectorMetadata,
    wanted: PrioritizedWantedSector[],
    wantedSimpleSectors: Set<[SectorScene, number]>
  ): number {
    // Simple detail
    wantedSimpleSectors.add([sector.scene, sector.sectorId]);
    wanted.push({
      sectorId: sector.sectorId,
      metadata: metadata!,
      levelOfDetail: LevelOfDetail.Simple,
      priority: sector.priority,
      scene: sector.scene
    });

    return this.computeSectorCost(metadata!);
  }

  private addDetailedSector(
    sector: PrioritizedSectorIdentifier,
    metadata: SectorMetadata | undefined,
    wanted: PrioritizedWantedSector[],
    wantedSimpleSectors: Set<[SectorScene, number]>,
    takenSectors: Set<[SectorScene, number]>
  ): number {
    // Find parents and "total cost" of sector
    const required: SectorMetadata[] = [];
    let totalCost = 0;
    // TODO 2020-04-12 larsmoa: Not sure if adding parents is a good idea
    while (metadata && !takenSectors.has([sector.scene, metadata.id])) {
      if (wantedSimpleSectors.has([sector.scene, metadata.id])) {
        console.log(`Skipped ${sector.sectorId} because ${metadata.path} is loaded simple`);
        break;
      }
      totalCost += this.computeSectorCost(metadata);
      takenSectors.add([sector.scene, metadata.id]);
      required.push(metadata);
      metadata = metadata.parent;
    }

    // Add "order"
    const offset = wanted.length;
    wanted.length = wanted.length + required.length;
    for (let i = 0; i < required.length; i++) {
      wanted[offset + i] = {
        sectorId: required[i].id,
        metadata: required[i],
        levelOfDetail: LevelOfDetail.Detailed,
        priority: sector.priority,
        scene: sector.scene
      };
    }
    return totalCost;
  }

  private determineLevelOfDetail(input: DetermineSectorsByProximityInput, sector: SectorMetadata): LevelOfDetail {
    const maxQuadSize =
      input.loadingHints && input.loadingHints.maxQuadSize
        ? input.loadingHints.maxQuadSize
        : this.options.defaultMaxQuadSize;

    const degToRadFactor = Math.PI / 180;
    const screenHeight =
      2.0 * distanceToCamera(sector, input.cameraPosition) * Math.tan((input.cameraFov / 2) * degToRadFactor);
    const largestAllowedQuadSize = maxQuadSize * screenHeight; // no larger than x percent of the height
    const quadSize = sector.facesFile.quadSize;
    if (quadSize < largestAllowedQuadSize && sector.facesFile.fileName) {
      return LevelOfDetail.Simple;
    } else if (quadSize < largestAllowedQuadSize) {
      // TODO 2020-04-10 larsmoa: Handle missing simple geometry better
      // No faces file for sector, just ignore it (missing faces files are usually due to very little geometry)
      return LevelOfDetail.Discarded;
    }
    return LevelOfDetail.Detailed;
  }

  private computeSectorCost(metadata: SectorMetadata): number {
    return metadata.indexFile.downloadSize;
  }
}

const distanceToCameraVars = {
  bbox: new THREE.Box3(),
  min: new THREE.Vector3(),
  max: new THREE.Vector3(),
  cameraPosition: new THREE.Vector3()
};

function distanceToCamera(s: SectorMetadata, camPos: vec3): number {
  const { bbox, min, max, cameraPosition } = distanceToCameraVars;

  min.set(s.bounds.min[0], s.bounds.min[1], s.bounds.min[2]);
  max.set(s.bounds.max[0], s.bounds.max[1], s.bounds.max[2]);
  bbox.makeEmpty();
  bbox.expandByPoint(min);
  bbox.expandByPoint(max);
  cameraPosition.set(camPos[0], camPos[1], camPos[2]);
  return bbox.distanceToPoint(cameraPosition);
}
