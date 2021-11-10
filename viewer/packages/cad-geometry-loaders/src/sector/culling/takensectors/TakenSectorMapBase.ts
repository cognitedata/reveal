/*!
 * Copyright 2021 Cognite AS
 */
import { PrioritizedWantedSector, SectorCost, SectorLoadingSpent } from '../types';
import { CadModelMetadata, LevelOfDetail } from '@reveal/cad-parsers';

export abstract class TakenSectorMapBase {
  protected abstract get modelsMetadata(): CadModelMetadata[];
  abstract get totalCost(): SectorCost;
  abstract collectWantedSectors(): PrioritizedWantedSector[];

  computeSpentBudget(): SectorLoadingSpent {
    const modelsMetadata = this.modelsMetadata;
    const wanted = this.collectWantedSectors();
    const nonDiscarded = wanted.filter(sector => sector.levelOfDetail !== LevelOfDetail.Discarded);

    const totalSectorCount = modelsMetadata.reduce((sum, x) => sum + x.scene.sectorCount, 0);
    const takenSectorCount = nonDiscarded.length;
    const takenSimpleCount = nonDiscarded.filter(x => x.levelOfDetail === LevelOfDetail.Simple).length;
    const forcedDetailedSectorCount = nonDiscarded.filter(x => !Number.isFinite(x.priority)).length;
    const accumulatedPriority = nonDiscarded
      .filter(sector => Number.isFinite(sector.priority) && sector.priority > 0)
      .reduce((sum, sector) => sum + sector.priority, 0);

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
}
