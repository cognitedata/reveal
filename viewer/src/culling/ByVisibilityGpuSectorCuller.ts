/*!
 * Copyright 2020 Cognite AS
 */

// Note! We introduce ThreeJS as a dependency here, but it's not exposed.
// If we add other rendering engines, we should consider to implement this in 'pure'
// WebGL.
import * as THREE from 'three';
import { vec3 } from 'gl-matrix';

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

type PrioritizedWantedSector = WantedSector & { priority: number };

/**
 * Options for creating GpuBasedSectorCuller.
 */
export type ByVisibilityGpuSectorCullerOptions = {
  /**
   * Use a custom coverage utility.
   */
  coverageUtil?: OrderSectorsByVisibleCoverage;
};

/**
 * Experimental implementation of SectorCuller that uses the GPU to determine an approximatin
 * of how "visible" each sector is to get a priority for each sector.
 */
export class ByVisibilityGpuSectorCuller implements SectorCuller {
  private readonly coverageUtil: OrderSectorsByVisibleCoverage;
  private readonly camera: THREE.Camera;
  private readonly models: CadModel[] = [];

  private determineLevelofDetailPreallocatedVars = {
    bbox: new THREE.Box3(),
    min: new THREE.Vector3(),
    max: new THREE.Vector3(),
    cameraPosition: new THREE.Vector3()
  };

  constructor(camera: THREE.Camera, options?: ByVisibilityGpuSectorCullerOptions) {
    this.camera = camera;
    this.coverageUtil = options && options.coverageUtil ? options.coverageUtil : new GpuOrderSectorsByVisibleCoverage();
  }

  addModel(cadModel: CadModel) {
    this.models.push(cadModel);
    this.coverageUtil.addModel(cadModel.scene, cadModel.modelTransformation);
  }

  determineSectors(input: DetermineSectorsByProximityInput): WantedSector[] {
    if (this.models.length > 1) {
      throw new Error('Support for multiple models has not been implemented');
    }
    const prioritized = this.coverageUtil.orderSectorsByVisibility(this.camera);

    const costLimit = 150 * 1024 * 1024;
    let costSpent = 0.0;

    const wanted: (WantedSector & { priority: number })[] = [];
    const wantedSimpleSectors = new Set<[SectorScene, number]>();
    const takenSectors = new Set<[SectorScene, number]>();

    // Add high details for all sectors the camera is inside
    costSpent += this.addHighDetailsForInsideSectors(input.cameraPosition, takenSectors, wanted);

    // Create a list of parents that are required for each entry of the prioritized list
    let debugAccumulatedPriority = 0.0;
    const prioritizedLength = prioritized.length;
    // Holds IDs of wanted simple sectors. No children of these should be loaded.
    for (let i = 0; i < prioritizedLength && costSpent < costLimit; i++) {
      const x = prioritized[i];
      const metadata = x.scene.getSectorById(x.sectorId);
      const levelOfDetail = this.determineLevelOfDetail(input, metadata!);
      debugAccumulatedPriority += x.priority;
      if (levelOfDetail === LevelOfDetail.Detailed) {
        costSpent += this.addDetailedSector(x, metadata, wanted, wantedSimpleSectors, takenSectors);
      } else if (levelOfDetail === LevelOfDetail.Simple) {
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
    takenSectors: Set<[SectorScene, number]>,
    wanted: PrioritizedWantedSector[]
  ): number {
    let costSpent = 0.0;
    this.models.forEach(model => {
      for (const sector of model.scene.getSectorsContainingPoint(cameraPosition)) {
        costSpent += this.computeSectorCost(sector);
        takenSectors.add([model.scene, sector.id]);
        wanted.push({
          sectorId: sector.id,
          metadata: sector,
          levelOfDetail: LevelOfDetail.Detailed,
          priority: Infinity
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
      priority: sector.priority
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
        priority: sector.priority
      };
    }
    return totalCost;
  }

  private determineLevelOfDetail(input: DetermineSectorsByProximityInput, sector: SectorMetadata): LevelOfDetail {
    const { bbox, min, max, cameraPosition } = this.determineLevelofDetailPreallocatedVars;

    function distanceToCamera(s: SectorMetadata) {
      min.set(s.bounds.min[0], s.bounds.min[1], s.bounds.min[2]);
      max.set(s.bounds.max[0], s.bounds.max[1], s.bounds.max[2]);
      bbox.makeEmpty();
      bbox.expandByPoint(min);
      bbox.expandByPoint(max);
      cameraPosition.set(input.cameraPosition[0], input.cameraPosition[1], input.cameraPosition[2]);
      return bbox.distanceToPoint(cameraPosition);
    }

    const maxQuadSize = 0.008;
    const degToRadFactor = Math.PI / 180;
    const screenHeight = 2.0 * distanceToCamera(sector) * Math.tan((input.cameraFov / 2) * degToRadFactor);
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
