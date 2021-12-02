/*!
 * Copyright 2021 Cognite AS
 */
import { TakenV8SectorTree } from './TakenV8SectorTree';
import { PrioritizedWantedSector, DetermineSectorCostDelegate, SectorCost, addSectorCost } from '../types';
import { CadModelSectorBudget } from '../../../CadModelSectorBudget';
import { TakenSectorMapBase } from './TakenSectorMapBase';

import { CadModelMetadata, V8SectorMetadata } from '@reveal/cad-parsers';

import assert from 'assert';

export class TakenV8SectorMap extends TakenSectorMapBase {
  private readonly _takenSectorTrees: Map<string, { sectorTree: TakenV8SectorTree; modelMetadata: CadModelMetadata }> =
    new Map();
  private readonly determineSectorCost: DetermineSectorCostDelegate<V8SectorMetadata>;

  get totalCost(): SectorCost {
    const totalCost: SectorCost = { downloadSize: 0, drawCalls: 0, renderCost: 0 };
    this._takenSectorTrees.forEach(({ sectorTree }) => {
      addSectorCost(totalCost, sectorTree.totalCost);
    });
    return totalCost;
  }

  get modelsMetadata(): CadModelMetadata[] {
    return Array.from(this._takenSectorTrees.values()).map(x => x.modelMetadata);
  }

  // TODO 2020-04-21 larsmoa: Unit test TakenSectorMap
  constructor(determineSectorCost: DetermineSectorCostDelegate<V8SectorMetadata>) {
    super();
    this.determineSectorCost = determineSectorCost;
  }

  initializeScene(modelMetadata: CadModelMetadata): void {
    assert(
      modelMetadata.scene.version === 8,
      `Only sector version 8 is supported, but got ${modelMetadata.scene.version}`
    );

    const sectorRoot = modelMetadata.scene.root as V8SectorMetadata;
    this._takenSectorTrees.set(modelMetadata.modelIdentifier, {
      sectorTree: new TakenV8SectorTree(sectorRoot, this.determineSectorCost),
      modelMetadata
    });
  }

  getWantedSectorCount(): number {
    let count = 0;
    this._takenSectorTrees.forEach(({ sectorTree }) => {
      count += sectorTree.getWantedSectorCount();
    });
    return count;
  }

  markSectorDetailed(model: CadModelMetadata, sectorId: number, priority: number): void {
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
    const currentCost = this.totalCost;
    return (
      currentCost.downloadSize < budget.geometryDownloadSizeBytes &&
      currentCost.drawCalls < budget.maximumNumberOfDrawCalls &&
      currentCost.renderCost < budget.maximumRenderCost
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

  clear(): void {
    this._takenSectorTrees.clear();
  }
}
