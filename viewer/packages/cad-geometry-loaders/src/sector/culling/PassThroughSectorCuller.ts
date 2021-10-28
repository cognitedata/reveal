/*!
 * Copyright 2021 Cognite AS
 */

import { DetermineSectorsInput, WantedSector } from 'internals';
import { SectorCuller } from './SectorCuller';
import { SectorLoadingSpent } from './types';

export class PassThroughSectorCuller implements SectorCuller {
  private _asd = false;

  determineSectors(input: DetermineSectorsInput): { wantedSectors: WantedSector[]; spentBudget: SectorLoadingSpent } {
    const wantedSectors = input.cadModelsMetadata.flatMap(metadata => {
      return metadata.scene.getAllSectors().map(sectorMetadata => {
        return {
          modelIdentifier: metadata.modelIdentifier,
          modelBaseUrl: metadata.modelBaseUrl,
          geometryClipBox: metadata.geometryClipBox,
          levelOfDetail: this._asd ? (sectorMetadata.id % 2 ? 2 : 0) : sectorMetadata.id % 2 ? 0 : 2,
          metadata: sectorMetadata
        } as WantedSector;
      });
    });

    const spentBudget: SectorLoadingSpent = {
      accumulatedPriority: 0,
      detailedSectorCount: 0,
      downloadSize: 0,
      drawCalls: 0,
      forcedDetailedSectorCount: 0,
      loadedSectorCount: 0,
      renderCost: 0,
      simpleSectorCount: 0,
      totalSectorCount: 0
    };

    this._asd = !this._asd;

    return { wantedSectors, spentBudget };
  }
  filterSectorsToLoad(input: DetermineSectorsInput, wantedSectorsBatch: WantedSector[]): Promise<WantedSector[]> {
    return Promise.resolve(wantedSectorsBatch);
  }
  dispose(): void {
    //no-op
  }
}
