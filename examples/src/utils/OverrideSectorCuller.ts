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
  ): reveal.internal.WantedSector[] {
    if (this._wantedSectors) {
      return this._wantedSectors;
    }
    return this._culler.determineSectors(input);
  }
}
