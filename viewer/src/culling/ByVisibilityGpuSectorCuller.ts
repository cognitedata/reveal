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
import { fromThreeMatrix } from '../views/threejs/utilities';
import { traverseUpwards, traverseDepthFirst } from '../utils/traversal';

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

type TakenSector = { metadata: SectorMetadata; lod: LevelOfDetail; priority: number; cost: number };
type TakenSectorDictionary = Map<SectorScene, Map<number, TakenSector>>;
class TakenSectorMap {
  // TODO 2020-04-21 larsmoa: Count cost in TakenSectorMap
  // TODO 2020-04-21 larsmoa: Unit test TakenSectorMap

  private readonly map: TakenSectorDictionary = new Map();
  private _totalCost: number = 0;

  get totalCost() {
    return this._totalCost;
  }

  /**
   * Finds first anchestor of the sector with the given LOD that already has been
   * added to the collection and returns it if found.
   */
  findAddedAnchestor(scene: SectorScene, sector: SectorMetadata, lod: LevelOfDetail): SectorMetadata | undefined {
    let result: SectorMetadata | undefined;
    traverseUpwards(sector, x => {
      const parentLod = this.getSectorLOD(scene, x.id);
      if (parentLod === lod) {
        result = x;
        return false;
      }
      return true;
    });
    return result;
  }

  removeAllChildrenOf(scene: SectorScene, sector: SectorMetadata): SectorMetadata[] {
    const removed: SectorMetadata[] = [];
    traverseDepthFirst(sector, x => {
      if (sector !== x && this.hasSector(scene, x.id)) {
        removed.push(x);
      }
      return true;
    });
    return removed;
  }

  hasSector(scene: SectorScene, sectorId: number): boolean {
    const sceneMap = this.map.get(scene);
    return sceneMap ? sceneMap.has(sectorId) : false;
  }

  getSectorLOD(scene: SectorScene, sectorId: number): LevelOfDetail | undefined {
    const sceneMap = this.map.get(scene);
    const entry = sceneMap ? sceneMap.get(sectorId) : undefined;
    return entry ? entry.lod : undefined;
  }

  getSectorCount(onlyFromScene?: SectorScene): number {
    let count = 0;
    this.map.forEach((taken, scene) => {
      if (onlyFromScene === undefined || scene === onlyFromScene) {
        count += taken.size;
      }
    });
    return count;
  }

  collectWantedSectors(scene: SectorScene): PrioritizedWantedSector[] {
    const sceneMap = this.map.get(scene);
    if (!sceneMap) {
      return [];
    }

    const wanted = Array.from(sceneMap.entries()).map(x => {
      const sectorId = x[0];
      const entry = x[1];
      return {
        scene,
        sectorId,
        levelOfDetail: entry.lod,
        metadata: entry.metadata,
        priority: entry.priority
      };
    });
    return wanted.sort((l, r) => r.priority - l.priority);
  }

  add(scene: SectorScene, sector: SectorMetadata, levelOfDetail: LevelOfDetail, priority: number) {
    const sectorId = sector.id;
    let sceneMap = this.map.get(scene);
    if (!sceneMap) {
      sceneMap = new Map<number, TakenSector>();
      this.map.set(scene, sceneMap);
    }
    const currentValue = sceneMap.get(sectorId);
    if (!currentValue) {
      const value = {
        metadata: sector,
        lod: levelOfDetail,
        priority,
        cost: computeSectorCost(sector, levelOfDetail)
      };
      this._totalCost += value.cost;
      sceneMap.set(sectorId, value);
    } else if (currentValue !== undefined) {
      throw new Error(`Sector ${scene}[${sectorId}] already added`);
    }

    // TODO 2020-04-21 larsmoa: Obey rules for adding/removing sectors to avoid duplicated geometry in this
    // function
  }

  remove(scene: SectorScene, sectorId: number) {
    const sceneMap = this.map.get(scene);
    if (sceneMap) {
      const removed = sceneMap.get(sectorId);
      if (removed) {
        sceneMap.delete(sectorId);
        this._totalCost -= removed.cost;
      }
    }
  }

  clear() {
    this.map.clear();
    this._totalCost = 0;
  }
}
function computeSectorCost(metadata: SectorMetadata, lod: LevelOfDetail): number {
  switch (lod) {
    case LevelOfDetail.Detailed:
      return metadata.indexFile.downloadSize;
    case LevelOfDetail.Simple:
      return metadata.facesFile.downloadSize;
    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
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
    const takenSectors = this.update(input);

    const wantedForScene = takenSectors.collectWantedSectors(input.sectorScene);
    // Mark anything not wanted, as Discarded
    traverseDepthFirst(input.sectorScene.root, x => {
      if (!takenSectors.hasSector(input.sectorScene, x.id)) {
        wantedForScene.push({
          sectorId: x.id,
          metadata: x,
          levelOfDetail: LevelOfDetail.Discarded,
          scene: input.sectorScene,
          priority: -1
        });
      }
      return true;
    });
    console.log(
      `Scene: ${wantedForScene.length} (${wantedForScene.filter(x => !Number.isFinite(x.priority)).length} required)`
    );

    return wantedForScene;
  }

  get lastWantedSectors(): PrioritizedWantedSector[] {
    return this.models.flatMap(m => this.lastUpdate.takenSectors.collectWantedSectors(m.scene));
  }

  private update(input: DetermineSectorsByProximityInput): TakenSectorMap {
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

    // Update wanted sectors
    const prioritized = coverageUtil.orderSectorsByVisibility(this.camera);
    this.lastUpdate.matrix = this.camera.matrix.clone();
    this.lastUpdate.projectionMatrix = this.camera.projectionMatrix.clone();

    const costLimit = this.options.costLimitMb * 1024 * 1024;

    // Add high details for all sectors the camera is inside or near
    const proximityThreshold = 10;
    this.addHighDetailsForNearSectors(proximityThreshold, takenSectors);

    // Create a list of parents that are required for each entry of the prioritized list
    const reservedForSimple = 0.1; // 10% of budget is resevered for simple geometry

    let debugAccumulatedPriority = 0.0;
    const prioritizedLength = prioritized.length;
    // // Holds IDs of wanted simple sectors. No children of these should be loaded.
    let i = 0;
    for (i = 0; i < prioritizedLength && takenSectors.totalCost < costLimit; i++) {
      const x = prioritized[i];
      const metadata = x.scene.getSectorById(x.sectorId);
      const levelOfDetail = this.determineLevelOfDetail(input, metadata!);
      debugAccumulatedPriority += x.priority;
      switch (levelOfDetail) {
        case LevelOfDetail.Detailed:
          if (takenSectors.totalCost < (1.0 - reservedForSimple) * costLimit) {
            this.addDetailedSector(x, metadata!, takenSectors);
            break;
          }
          console.log(`Reverting to simple for ${metadata!.path}`);

        case LevelOfDetail.Simple:
          this.addSimpleSector(x, metadata!, takenSectors);
          break;

        default:
          throw new Error(`Unexpected levelOfDetail ${levelOfDetail}`);
      }
    }
    console.log(
      `Retrieving ${i} of ${prioritizedLength} (last: ${prioritized.length > 0 ? prioritized[i - 1] : null})`
    );
    console.log(
      `Total scheduled: ${takenSectors.getSectorCount()} of ${prioritizedLength} (cost: ${takenSectors.totalCost /
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
        takenSectors.add(model.scene, intersectingSectors[i], LevelOfDetail.Detailed, Infinity);
      }
    });
  }

  private addSimpleSector(sector: PrioritizedSectorIdentifier, metadata: SectorMetadata, takenSectors: TakenSectorMap) {
    const scene = sector.scene;

    const anchestorAlreadyAdded = !!takenSectors.findAddedAnchestor(scene, metadata, LevelOfDetail.Simple);
    if (anchestorAlreadyAdded) {
      // Don't add if a anchestor already is accepted
      return 0;
    }

    // Remove any children that might have been already added
    // TODO 2020-04-21 larsmoa: Account for saved cost
    takenSectors.removeAllChildrenOf(sector.scene, metadata);

    takenSectors.add(scene, metadata, LevelOfDetail.Simple, sector.priority);
  }

  private addDetailedSector(
    sector: PrioritizedSectorIdentifier,
    metadata: SectorMetadata,
    takenSectors: TakenSectorMap
  ) {
    // Check if any parent is added as low-detail and remove low detail if so
    let simpleSector: SectorMetadata | undefined;
    traverseUpwards(metadata, x => {
      const parentLod = takenSectors.getSectorLOD(sector.scene, sector.sectorId);
      if (parentLod === LevelOfDetail.Simple) {
        simpleSector = x;
        return false;
      }
      return true;
    });
    if (simpleSector) {
      // Remove low-detail to avoid duplicated geometry
      takenSectors.remove(sector.scene, simpleSector.id);
    }

    // TODO 2020-04-12 larsmoa: Not sure if adding parents is a good idea, even though it's required
    // by the 'contract'

    // Add sector and all parents
    let parent: SectorMetadata | undefined = metadata;
    while (parent && !takenSectors.hasSector(sector.scene, parent.id)) {
      takenSectors.add(sector.scene, parent, LevelOfDetail.Detailed, sector.priority);
      parent = parent.parent;
    }
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
