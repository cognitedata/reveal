/*!
 * Copyright 2020 Cognite AS
 */

// Note! We introduce ThreeJS as a dependency here, but it's not exposed.
// If we add other rendering engines, we should consider to implement this in 'pure'
// WebGL.
import * as THREE from 'three';

import { WantedSector } from '../data/model/WantedSector';
import { SectorScene } from '../models/cad/types';
import { CadModel } from '../models/cad/CadModel';
import { DetermineSectorsByProximityInput } from '../models/cad/determineSectors';
import {
  GpuOrderSectorsByVisibleCoverage,
  OrderSectorsByVisibleCoverage
} from '../views/threejs/GpuOrderSectorsByVisibleCoverage';
import { SectorCuller } from './SectorCuller';
import { traverseDepthFirst } from '../utils/traversal';
import { TakenSectorTree } from './TakenSectorTree';
import { PrioritizedWantedSector } from './types';
import { fromThreeMatrix } from '../views/threejs/utilities';
import { mat4 } from 'gl-matrix';

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

  // TODO 2020-04-21 larsmoa: Unit test TakenSectorMap

  initializeScene(scene: SectorScene) {
    this.maps.set(scene, new TakenSectorTree(scene.root));
  }

  getWantedSectorCount(): number {
    let count = 0;
    this.maps.forEach(tree => {
      count += tree.getWantedSectorCount();
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

/**
 * Experimental implementation of SectorCuller that uses the GPU to determine an approximatin
 * of how "visible" each sector is to get a priority for each sector.
 */
export class ByVisibilityGpuSectorCuller implements SectorCuller {
  public static readonly DefaultMaxQuadSize = 0.004;
  public static readonly DefaultCostLimitMb = 110;
  public static readonly DefaultHighDetailProximityThreshold = 10;

  private readonly options: Required<ByVisibilityGpuSectorCullerOptions>;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly models: CadModel[] = [];
  private readonly lastUpdate = {
    matrix: new THREE.Matrix4(),
    projectionMatrix: new THREE.Matrix4(),
    takenSectors: new TakenSectorMap()
    // TODO 2020-04-20 larsmoa: Remove the need for this and merge with takenSectors
    // wanted: [] as PrioritizedWantedSector[]
  };

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
    const takenSectors = this.update();

    const wantedForScene = takenSectors.collectWantedSectors(input.sectorScene);
    console.log(
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

    this.models.forEach(x => takenSectors.markSectorDetailed(x.scene, 0, 1));
    this.models.forEach(x => {
      traverseDepthFirst(x.scene.root, y => {
        if (y.id % 2 === 0) {
          takenSectors.markSectorDetailed(x.scene, y.id, 1);
        }
        return y.depth < 4;
      });
    });
    // Update wanted sectors
    const prioritized = coverageUtil.orderSectorsByVisibility(this.camera);
    this.lastUpdate.matrix = this.camera.matrix.clone();
    this.lastUpdate.projectionMatrix = this.camera.projectionMatrix.clone();

    const costLimit = this.options.costLimitMb * 1024 * 1024;

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
    console.log(
      `Retrieving ${i} of ${prioritizedLength} (last: ${prioritized.length > 0 ? prioritized[i - 1] : null})`
    );
    console.log(
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
}
