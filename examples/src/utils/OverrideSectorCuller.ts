/*!
 * Copyright 2020 Cognite AS
 */

import * as reveal from '@cognite/reveal/experimental';

export class OverrideSectorCuller implements reveal.internal.SectorCuller {
  private _wantedSectors?: reveal.internal.WantedSector[];
  private readonly _culler: reveal.internal.SectorCuller;

  constructor() {
    this._culler = new reveal.internal.ByVisibilityGpuSectorCuller();
  }

  filterSectorsToLoad(input: reveal.internal.DetermineSectorsInput, wantedSectorsBatch: reveal.internal.WantedSector[]): Promise<reveal.internal.WantedSector[]> {
    return Promise.resolve(wantedSectorsBatch);
  }

  dispose() {
    this._culler.dispose();
  }

  set overrideWantedSectors(
    sectors: reveal.internal.WantedSector[] | undefined
  ) {
    this._wantedSectors = sectors;
  }

  get overrideWantedSectors(): reveal.internal.WantedSector[] | undefined {
    return this._wantedSectors;
  }

  determineSectors(
    input: reveal.internal.DetermineSectorsInput
  ) {
    if (this._wantedSectors) {
      const spendage: reveal.internal.CadModelSectorLoadStatistics = {
        downloadSize : 0,
        drawCalls : 0,
        loadedSectorCount : 0,
        simpleSectorCount : 0,
        detailedSectorCount : 0,
        forcedDetailedSectorCount : 0,
        totalSectorCount : 0,
        accumulatedPriority : 0
      };
      return {spendage, wantedSectors: this._wantedSectors };
    }
    return this._culler.determineSectors(input);
  }
}
