/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail, WantedSector } from '../../internal';
import { SectorScene, SectorMetadata } from './types';

/**
 * Keeps number of loads within a specified budget.
 */
export interface CadBudget {
  maxDrawCount?: number;
  maxDownloadSize?: number;
  filter(wanted: WantedSector[], sectorScene: SectorScene): WantedSector[];
}

/**
 * Creates a default budget.
 */
export function createDefaultCadBudget(): CadBudget {
  const budget = new CadBudgetImpl();
  return budget;
}

/**
 * Default CAD budget implementation.
 */
export class CadBudgetImpl implements CadBudget {
  maxDrawCount?: number;
  maxDownloadSize?: number;

  filter(wanted: WantedSector[], sectorScene: SectorScene): WantedSector[] {
    const accumulator = new CadBudgetAccumulator(this, sectorScene);
    return accumulator.filter(wanted);
  }
}

type CadBudgetSpendage = {
  drawCallCount: number;
  downloadSize: number;
  sectorCount?: number;
};

class CadBudgetAccumulator {
  readonly lastSpendage: CadBudgetSpendage;
  private budget: CadBudget;
  private readonly sectors: SectorScene;

  constructor(budget: CadBudget, sectors: SectorScene) {
    this.sectors = sectors;
    this.budget = budget;
    this.lastSpendage = {
      drawCallCount: 0,
      downloadSize: 0,
      sectorCount: 0
    };
  }

  filter(wanted: WantedSector[]): WantedSector[] {
    const spendage: CadBudgetSpendage = {
      drawCallCount: 0,
      downloadSize: 0,
      sectorCount: 0
    };
    const filtered = wanted.filter(x => this.tryAddWantedSector(x, spendage));
    Object.assign(this.lastSpendage, spendage);
    return filtered;
  }

  private tryAddWantedSector(candidate: WantedSector, accumulatedSpendage: CadBudgetSpendage): boolean {
    const sectorMetadata = this.sectors.sectors.get(candidate.id);
    if (!sectorMetadata) {
      throw new Error(`Could not find metadata for sector ${candidate.id}`);
    }

    const candidateSpendage = this.getCandidateSpendage(candidate, sectorMetadata);
    return this.tryAddSpendage(candidateSpendage, accumulatedSpendage);
  }

  private getCandidateSpendage(candidate: WantedSector, sectorMetadata: SectorMetadata): CadBudgetSpendage {
    switch (candidate.levelOfDetail) {
      case LevelOfDetail.Simple:
        // TODO 2020-03-22 larsmoa: Need some better estimate of complexity than 1 drawCount
        return { downloadSize: sectorMetadata.facesFile.downloadSize, drawCallCount: 1 };
      case LevelOfDetail.Detailed:
        return {
          downloadSize: sectorMetadata.indexFile.downloadSize,
          drawCallCount: sectorMetadata.indexFile.estimatedDrawCallCount
        };
      case LevelOfDetail.Discarded:
        return {
          downloadSize: 0,
          drawCallCount: 0
        };
      default:
        throw new Error(`Unsupported LOD-level: '${candidate.levelOfDetail}'`);
    }
  }

  private tryAddSpendage(candidateSpendage: CadBudgetSpendage, accumulatedSpendage: CadBudgetSpendage): boolean {
    const newAcculumated: CadBudgetSpendage = {
      drawCallCount: candidateSpendage.drawCallCount + accumulatedSpendage.drawCallCount,
      downloadSize: candidateSpendage.downloadSize + accumulatedSpendage.downloadSize,
      sectorCount: (candidateSpendage.sectorCount || 0) + 1
    };
    if (
      (this.budget.maxDrawCount === undefined || newAcculumated.drawCallCount <= this.budget.maxDrawCount) &&
      (this.budget.maxDownloadSize === undefined || newAcculumated.downloadSize <= this.budget.maxDownloadSize)
    ) {
      Object.assign(accumulatedSpendage, newAcculumated);
      return true;
    }
    return false;
  }
}
}
