/*!
 * Copyright 2021 Cognite AS
 */

import { DetermineSectorsInput, WantedSector } from 'internals';
import { SectorCuller } from './SectorCuller';
import { SectorLoadingSpent } from './types';

export class PassThroughSectorCuller implements SectorCuller {
  determineSectors(input: DetermineSectorsInput): { wantedSectors: WantedSector[]; spentBudget: SectorLoadingSpent } {
    const wantedSectors = input.cadModelsMetadata.flatMap(metadata => {
      return metadata.scene.getAllSectors().map(sectorMetadata => {
        return {
          modelIdentifier: metadata.modelIdentifier,
          modelBaseUrl: metadata.modelBaseUrl,
          geometryClipBox: metadata.geometryClipBox,
          levelOfDetail: 2,
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

    return { wantedSectors, spentBudget };
  }

  filterSectorsToLoad(_: DetermineSectorsInput, wantedSectorsBatch: WantedSector[]): Promise<WantedSector[]> {
    return Promise.resolve(wantedSectorsBatch);
  }

  dispose(): void {}
}
