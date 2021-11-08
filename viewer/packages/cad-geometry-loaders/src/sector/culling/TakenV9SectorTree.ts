/*!
 * Copyright 2021 Cognite AS
 */
import {
  addSectorCost,
  DetermineSectorCostDelegate,
  PrioritizedWantedSector,
  SectorCost,
  SectorLoadingSpent
} from './types';
import { CadModelSectorBudget } from '../../CadModelSectorBudget';
import { CadModelMetadata, V9SectorMetadata, LevelOfDetail } from '@reveal/cad-parsers';
import { traverseDepthFirst } from '@reveal/utilities';
import assert from 'assert';

export class TakenV9SectorTree {
  private readonly determineSectorCost: DetermineSectorCostDelegate<V9SectorMetadata>;
  private readonly _totalCost: SectorCost = { downloadSize: 0, drawCalls: 0, renderCost: 0 };
  private readonly _models = new Map<string, { model: CadModelMetadata; sectorIds: Map<number, number> }>();

  get totalCost(): SectorCost {
    return { ...this._totalCost };
  }

  constructor(determineSectorCost: DetermineSectorCostDelegate<V9SectorMetadata>) {
    this.determineSectorCost = determineSectorCost;
  }

  initializeScene(modelMetadata: CadModelMetadata) {
    this._models.set(modelMetadata.modelIdentifier, { model: modelMetadata, sectorIds: new Map<number, number>() });
  }

  getWantedSectorCount(): number {
    let count = 0;
    this._models.forEach(x => {
      count += x.sectorIds.size;
    });
    return count;
  }

  markSectorDetailed(model: CadModelMetadata, sectorId: number, priority: number) {
    const entry = this._models.get(model.modelIdentifier);
    assert(!!entry, `Could not find sector tree for ${model.modelIdentifier}`);

    const { sectorIds } = entry!;
    const existingPriority = sectorIds.get(sectorId);
    if (existingPriority === undefined) {
      const sectorMetadata = model.scene.getSectorById(sectorId);
      assert(sectorMetadata !== undefined);

      const sectorCost = this.determineSectorCost(sectorMetadata! as V9SectorMetadata, LevelOfDetail.Detailed);
      addSectorCost(this._totalCost, sectorCost);

      sectorIds.set(sectorId, priority);
    } else {
      sectorIds.set(sectorId, Math.max(priority, existingPriority));
    }
  }

  isWithinBudget(budget: CadModelSectorBudget): boolean {
    return (
      this._totalCost.downloadSize < budget.geometryDownloadSizeBytes &&
      this._totalCost.drawCalls < budget.maximumNumberOfDrawCalls &&
      this._totalCost.renderCost < budget.maximumRenderCost
    );
  }

  collectWantedSectors(): PrioritizedWantedSector[] {
    const allWanted = new Array<PrioritizedWantedSector>();

    // Collect sectors
    for (const [modelIdentifier, sectorsContainer] of this._models) {
      const { model, sectorIds } = sectorsContainer;

      const allSectorsInModel = new Map<number, PrioritizedWantedSector>();
      traverseDepthFirst(model.scene.root, sector => {
        allSectorsInModel.set(sector.id, {
          modelIdentifier,
          modelBaseUrl: model.modelBaseUrl,
          geometryClipBox: null,
          levelOfDetail: LevelOfDetail.Discarded,
          metadata: sector,
          priority: -1
        });
        return true;
      });
      for (const [sectorId, priority] of sectorIds) {
        const sector = model.scene.getSectorById(sectorId)!;
        const wantedSector: PrioritizedWantedSector = {
          modelIdentifier,
          modelBaseUrl: model.modelBaseUrl,
          geometryClipBox: null,
          levelOfDetail: LevelOfDetail.Detailed,
          metadata: sector,
          priority
        };
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

  computeSpentBudget(): SectorLoadingSpent {
    const wanted = this.collectWantedSectors();
    const models = Array.from(this._models.values()).map(x => x.model);
    const nonDiscarded = wanted.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    const totalSectorCount = models.reduce((sum, x) => sum + x.scene.sectorCount, 0);
    const takenSectorCount = nonDiscarded.length;
    const takenSimpleCount = nonDiscarded.filter(x => x.levelOfDetail === LevelOfDetail.Simple).length;
    const forcedDetailedSectorCount = nonDiscarded.filter(x => !Number.isFinite(x.priority)).length;
    const accumulatedPriority = nonDiscarded
      .filter(x => Number.isFinite(x.priority) && x.priority > 0)
      .reduce((sum, x) => sum + x.priority, 0);

    const spentBudget: SectorLoadingSpent = {
      drawCalls: this.totalCost.drawCalls,
      downloadSize: this.totalCost.downloadSize,
      renderCost: this.totalCost.renderCost,
      totalSectorCount,
      forcedDetailedSectorCount,
      loadedSectorCount: takenSectorCount,
      simpleSectorCount: takenSimpleCount,
      detailedSectorCount: takenSectorCount - takenSimpleCount,
      accumulatedPriority
    };

    return spentBudget;
  }

  clear() {
    this._models.clear();
  }
}
