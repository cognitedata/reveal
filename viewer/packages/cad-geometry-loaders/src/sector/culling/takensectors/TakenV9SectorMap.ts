/*!
 * Copyright 2021 Cognite AS
 */
import { addSectorCost, DetermineSectorCostDelegate, PrioritizedWantedSector, SectorCost } from '../types';
import { CadModelBudget } from '../../../CadModelBudget';
import { TakenSectorMapBase } from './TakenSectorMapBase';

import { CadModelMetadata, LevelOfDetail, SectorMetadata } from '@reveal/cad-parsers';
import { traverseDepthFirst } from '@reveal/utilities';

import assert from 'assert';
import type { Box3 } from 'three';

export class TakenV9SectorMap extends TakenSectorMapBase {
  private readonly determineSectorCost: DetermineSectorCostDelegate<SectorMetadata>;
  private readonly _totalCost: SectorCost = { downloadSize: 0, drawCalls: 0, renderCost: 0 };
  private readonly _models = new Map<string, { modelMetadata: CadModelMetadata; sectorIds: Map<number, number> }>();

  get totalCost(): SectorCost {
    return { ...this._totalCost };
  }

  get modelsMetadata(): CadModelMetadata[] {
    return Array.from(this._models.values()).map(cadModel => cadModel.modelMetadata);
  }

  constructor(determineSectorCost: DetermineSectorCostDelegate<SectorMetadata>) {
    super();
    this.determineSectorCost = determineSectorCost;
  }

  initializeScene(modelMetadata: CadModelMetadata): void {
    assert(
      modelMetadata.scene.version === 9,
      `Only sector version 9 is supported, but got ${modelMetadata.scene.version}`
    );

    this._models.set(modelMetadata.modelIdentifier, {
      modelMetadata: modelMetadata,
      sectorIds: new Map<number, number>()
    });
  }

  markSectorDetailed(model: CadModelMetadata, sectorId: number, priority: number): void {
    const entry = this._models.get(model.modelIdentifier);
    assert(!!entry, `Could not find sector tree for ${model.modelIdentifier}`);

    const { sectorIds } = entry!;
    const existingPriority = sectorIds.get(sectorId);
    if (existingPriority !== undefined) {
      sectorIds.set(sectorId, Math.max(priority, existingPriority));
    } else {
      const sectorMetadata = model.scene.getSectorById(sectorId);
      assert(sectorMetadata !== undefined);

      const sectorCost = this.determineSectorCost(sectorMetadata!, LevelOfDetail.Detailed);
      addSectorCost(this._totalCost, sectorCost);

      sectorIds.set(sectorId, priority);
    }
  }

  isWithinBudget(budget: CadModelBudget): boolean {
    return this._totalCost.renderCost < budget.maximumRenderCost;
  }

  collectWantedSectors(): PrioritizedWantedSector[] {
    const allWanted = new Array<PrioritizedWantedSector>();

    // Collect sectors
    for (const [modelIdentifier, sectorsContainer] of this._models) {
      const { modelMetadata: model, sectorIds } = sectorsContainer;

      const allSectorsInModel = new Map<number, PrioritizedWantedSector>();
      traverseDepthFirst(model.scene.root, sector => {
        allSectorsInModel.set(
          sector.id,
          toWantedSector(modelIdentifier, model, sector, LevelOfDetail.Discarded, -1, model.geometryClipBox)
        );
        return true;
      });

      for (const [sectorId, priority] of sectorIds) {
        const sector = model.scene.getSectorById(sectorId)!;
        const wantedSector = toWantedSector(
          modelIdentifier,
          model,
          sector,
          LevelOfDetail.Detailed,
          priority,
          model.geometryClipBox
        );
        allSectorsInModel.set(sectorId, wantedSector);
      }

      allSectorsInModel.forEach(x => allWanted.push(x));
    }

    // Sort by state (discarded comes first), then priority
    allWanted.sort((l, r) => {
      if (l.levelOfDetail === LevelOfDetail.Discarded) {
        return -1;
      } else if (r.levelOfDetail === LevelOfDetail.Discarded) {
        return 1;
      }
      return r.priority - l.priority;
    });
    return allWanted;
  }

  clear(): void {
    this._models.clear();
  }
}

function toWantedSector(
  modelIdentifier: string,
  model: CadModelMetadata,
  sector: SectorMetadata,
  levelOfDetail: LevelOfDetail,
  priority: number,
  geometryClipBox: Box3 | null
): PrioritizedWantedSector {
  const prioritizedSector: PrioritizedWantedSector = {
    modelIdentifier,
    modelBaseUrl: model.modelBaseUrl,
    geometryClipBox,
    levelOfDetail,
    metadata: sector,
    priority
  };
  return prioritizedSector;
}
