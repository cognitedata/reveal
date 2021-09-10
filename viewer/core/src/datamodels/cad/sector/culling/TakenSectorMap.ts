/*!
 * Copyright 2021 Cognite AS
 */
import { TakenSectorTree } from './TakenSectorTree';
import {
  PrioritizedWantedSector,
  DetermineSectorCostDelegate,
  SectorCost,
  addSectorCost,
  SectorLoadingSpent
} from './types';
import { CadModelMetadata } from '../../CadModelMetadata';
import { CadModelSectorBudget } from '../../CadModelSectorBudget';
import { LevelOfDetail } from '../LevelOfDetail';
import assert from 'assert';

export class TakenSectorMap {
  private readonly _takenSectorTrees: Map<string, { sectorTree: TakenSectorTree; modelMetadata: CadModelMetadata }> =
    new Map();
  private readonly determineSectorCost: DetermineSectorCostDelegate;

  get totalCost(): SectorCost {
    const totalCost: SectorCost = { downloadSize: 0, drawCalls: 0 };
    this._takenSectorTrees.forEach(({ sectorTree }) => {
      addSectorCost(totalCost, sectorTree.totalCost);
    });
    return totalCost;
  }

  // TODO 2020-04-21 larsmoa: Unit test TakenSectorMap
  constructor(determineSectorCost: DetermineSectorCostDelegate) {
    this.determineSectorCost = determineSectorCost;
  }

  initializeScene(modelMetadata: CadModelMetadata) {
    this._takenSectorTrees.set(modelMetadata.modelIdentifier, {
      sectorTree: new TakenSectorTree(modelMetadata.scene.root, this.determineSectorCost),
      modelMetadata
    });
  }

  getWantedSectorCount(): number {
    let count = 0;
    this._takenSectorTrees.forEach(({ sectorTree }) => {
      count += sectorTree.determineWantedSectorCount();
    });
    return count;
  }

  markSectorDetailed(model: CadModelMetadata, sectorId: number, priority: number) {
    const entry = this._takenSectorTrees.get(model.modelIdentifier);
    assert(
      !!entry,
      `Could not find sector tree for ${model.modelIdentifier} (have trees ${Array.from(
        this._takenSectorTrees.keys()
      ).join(', ')})`
    );
    const { sectorTree } = entry!;
    sectorTree!.markSectorDetailed(sectorId, priority);
  }

  isWithinBudget(budget: CadModelSectorBudget): boolean {
    return (
      this.totalCost.downloadSize < budget.geometryDownloadSizeBytes &&
      this.totalCost.drawCalls < budget.maximumNumberOfDrawCalls
    );
  }

  collectWantedSectors(): PrioritizedWantedSector[] {
    const allWanted = new Array<PrioritizedWantedSector>();

    // Collect sectors
    for (const [modelIdentifier, { sectorTree, modelMetadata }] of this._takenSectorTrees) {
      allWanted.push(
        ...sectorTree.toWantedSectors(modelIdentifier, modelMetadata.modelBaseUrl, modelMetadata.geometryClipBox)
      );
    }

    // Sort by priority
    allWanted.sort((l, r) => r.priority - l.priority);
    return allWanted;
  }

  computeSpentBudget(): SectorLoadingSpent {
    const wanted = this.collectWantedSectors();
    const models = Array.from(this._takenSectorTrees.values()).map(x => x.modelMetadata);
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
    this._takenSectorTrees.clear();
  }
}
