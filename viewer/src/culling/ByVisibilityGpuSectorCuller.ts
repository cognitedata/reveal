/*!
 * Copyright 2020 Cognite AS
 */

// Note! We introduce ThreeJS as a dependency here, but it's not exposed.
// If we add other rendering engines, we should consider to implement this in 'pure'
// WebGL.
import * as THREE from 'three';
import { mat4 } from 'gl-matrix';

import { WantedSector } from '../data/model/WantedSector';
import { SectorScene } from '../models/cad/SectorScene';
import { CadModel } from '../models/cad/CadModel';
import { DetermineSectorsByProximityInput } from '../models/cad/determineSectors';
import {
  GpuOrderSectorsByVisibilityCoverage,
  OrderSectorsByVisibilityCoverage
} from '../views/threejs/OrderSectorsByVisibilityCoverage';
import { SectorCuller } from './SectorCuller';
import { TakenSectorTree } from './TakenSectorTree';
import { PrioritizedWantedSector, DetermineSectorCostDelegate } from './types';
import { fromThreeMatrix } from '../views/threejs/utilities';
import { LevelOfDetail } from '../data/model/LevelOfDetail';
import { SectorMetadata } from '../models/cad/types';

/**
 * Options for creating GpuBasedSectorCuller.
 */
export type ByVisibilityGpuSectorCullerOptions = {
  /**
   * Limit of how much data to load for a given view point. By default cost is measured in
   * downloaded bytes per sector.
   */
  costLimit?: number;

  /**
   * Optional callback for determining the cost of a sector. The default unit of the cost
   * function is bytes downloaded.
   */
  determineSectorCost?: DetermineSectorCostDelegate;

  /**
   * Sectors within this distance from the camera will always be loaded in high details.
   */
  highDetailProximityThreshold?: number;

  /**
   * Use a custom coverage utility to determine how "visible" each sector is.
   */
  coverageUtil?: OrderSectorsByVisibilityCoverage;

  /**
   * Logging function for debugging.
   */
  logCallback?: (message?: any, ...optionalParameters: any[]) => void;
};

function assert(condition: boolean, message: string = 'assertion hit') {
  // tslint:disable-next-line: no-console
  console.assert(condition, message);
}

class TakenSectorMap {
  get totalCost() {
    let totalCost = 0;
    this.maps.forEach(tree => {
      totalCost += tree.totalCost;
    });
    return totalCost;
  }
  private readonly maps: Map<SectorScene, TakenSectorTree> = new Map();
  private readonly determineSectorCost: DetermineSectorCostDelegate;

  // TODO 2020-04-21 larsmoa: Unit test TakenSectorMap
  constructor(determineSectorCost: DetermineSectorCostDelegate) {
    this.determineSectorCost = determineSectorCost;
  }

  initializeScene(scene: SectorScene) {
    this.maps.set(scene, new TakenSectorTree(scene.root, this.determineSectorCost));
  }

  getWantedSectorCount(): number {
    let count = 0;
    this.maps.forEach(tree => {
      count += tree.determineWantedSectorCount();
    });
    return count;
  }

  markSectorDetailed(scene: SectorScene, sectorId: number, priority: number) {
    const tree = this.maps.get(scene);
    assert(!!tree);
    tree!.markSectorDetailed(sectorId, priority);
  }

  collectWantedSectors(scene: SectorScene): PrioritizedWantedSector[] {
    const tree = this.maps.get(scene);
    if (!tree) {
      return [];
    }
    return tree.toWantedSectors(scene);
  }

  clear() {
    this.maps.clear();
  }
}

const invalidMatrixArray: number[] = Array(16).map(_ => NaN);

/**
 * SectorCuller that uses the GPU to determine an approximation
 * of how "visible" each sector is to get a priority for each sector
 * and loads sectors based on priority within a budget.
 */
export class ByVisibilityGpuSectorCuller implements SectorCuller {
  public static readonly DefaultCostLimit = 50 * 1024 * 1024;
  public static readonly DefaultHighDetailProximityThreshold = 10;

  private readonly options: Required<ByVisibilityGpuSectorCullerOptions>;
  private readonly camera: THREE.PerspectiveCamera;
  // private readonly models: CadModel[] = [];
  private readonly lastUpdate: {
    readonly matrix: THREE.Matrix4;
    readonly projectionMatrix: THREE.Matrix4;
    takenSectors: TakenSectorMap;
  };

  constructor(camera: THREE.PerspectiveCamera, options?: ByVisibilityGpuSectorCullerOptions) {
    this.options = {
      costLimit: options && options.costLimit ? options.costLimit : ByVisibilityGpuSectorCuller.DefaultCostLimit,
      determineSectorCost:
        options && options.determineSectorCost ? options.determineSectorCost : computeSectorCostAsDownloadSize,
      highDetailProximityThreshold:
        options && options.highDetailProximityThreshold
          ? options.highDetailProximityThreshold
          : ByVisibilityGpuSectorCuller.DefaultHighDetailProximityThreshold,
      logCallback:
        options && options.logCallback
          ? options.logCallback
          : // No logging
            () => {},

      coverageUtil: options && options.coverageUtil ? options.coverageUtil : new GpuOrderSectorsByVisibilityCoverage()
    };
    this.lastUpdate = {
      matrix: new THREE.Matrix4().fromArray(invalidMatrixArray),
      projectionMatrix: new THREE.Matrix4().fromArray(invalidMatrixArray),
      takenSectors: new TakenSectorMap(this.options.determineSectorCost)
    };
    this.camera = camera;
  }

  /*
  addModel(cadModel: CadModel) {
    const { coverageUtil } = this.options;
    this.models.push(cadModel);
    coverageUtil.addModel(cadModel.scene, cadModel.modelTransformation);
  }*/

  determineSectors(input: DetermineSectorsByProximityInput): WantedSector[] {
    const wantedForScene = takenSectors.collectWantedSectors(input.sectorScene);
    this.log(
      `Scene: ${wantedForScene.length} (${wantedForScene.filter(x => !Number.isFinite(x.priority)).length} required)`
    );

    return wantedForScene;
  }

  get lastWantedSectors(): PrioritizedWantedSector[] {
    return this.models.flatMap(m => this.lastUpdate.takenSectors.collectWantedSectors(m.scene));
  }

  private update(): TakenSectorMap {
    const { coverageUtil } = this.options;
    const takenSectors = this.lastUpdate.takenSectors;
    // Necessary to update?
    const changed =
      !this.lastUpdate.matrix.equals(this.camera.matrix) ||
      !this.lastUpdate.projectionMatrix.equals(this.camera.projectionMatrix);

    if (!changed) {
      return takenSectors;
    }
    takenSectors.clear();
    this.models.forEach(x => takenSectors.initializeScene(x.scene));

    // Update wanted sectors
    const prioritized = coverageUtil.orderSectorsByVisibility(this.camera);
    this.lastUpdate.matrix.copy(this.camera.matrix);
    this.lastUpdate.projectionMatrix.copy(this.camera.projectionMatrix);

    const costLimit = this.options.costLimit;

    // Add high details for all sectors the camera is inside or near
    const proximityThreshold = 10;
    this.addHighDetailsForNearSectors(proximityThreshold, takenSectors);

    let debugAccumulatedPriority = 0.0;
    const prioritizedLength = prioritized.length;

    let i = 0;
    for (i = 0; i < prioritizedLength && takenSectors.totalCost < costLimit; i++) {
      const x = prioritized[i];
      takenSectors.markSectorDetailed(x.scene, x.sectorId, x.priority);
      debugAccumulatedPriority += x.priority;
    }
    this.log(`Retrieving ${i} of ${prioritizedLength} (last: ${prioritized.length > 0 ? prioritized[i - 1] : null})`);
    this.log(
      `Total scheduled: ${takenSectors.getWantedSectorCount()} of ${prioritizedLength} (cost: ${takenSectors.totalCost /
        1024 /
        1024}/${costLimit / 1024 / 1024}, priority: ${debugAccumulatedPriority})`
    );

    return takenSectors;
  }

  private addHighDetailsForNearSectors(proximityThreshold: number, takenSectors: TakenSectorMap) {
    const shortRangeCamera = this.camera.clone(true);
    shortRangeCamera.far = proximityThreshold;
    shortRangeCamera.updateProjectionMatrix();
    const cameraMatrixWorldInverse = fromThreeMatrix(mat4.create(), shortRangeCamera.matrixWorldInverse);
    const cameraProjectionMatrix = fromThreeMatrix(mat4.create(), shortRangeCamera.projectionMatrix);

    const transformedCameraMatrixWorldInverse = mat4.create();
    this.models.forEach(model => {
      // Apply model transformation to camera matrix
      mat4.multiply(
        transformedCameraMatrixWorldInverse,
        cameraMatrixWorldInverse,
        model.modelTransformation.modelMatrix
      );

      const intersectingSectors = model.scene.getSectorsIntersectingFrustum(
        cameraProjectionMatrix,
        transformedCameraMatrixWorldInverse
      );
      for (let i = 0; i < intersectingSectors.length; i++) {
        takenSectors.markSectorDetailed(model.scene, intersectingSectors[i].id, Infinity);
      }
    });
  }

  private log(message?: any, ...optionalParameters: any[]) {
    this.options.logCallback(message, ...optionalParameters);
  }
}

function computeSectorCostAsDownloadSize(metadata: SectorMetadata, lod: LevelOfDetail): number {
  switch (lod) {
    case LevelOfDetail.Detailed:
      return metadata.indexFile.downloadSize;
    case LevelOfDetail.Simple:
      return metadata.facesFile.downloadSize;
    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}
