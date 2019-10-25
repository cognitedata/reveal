/*!
 * Copyright 2019 Cognite AS
 */

import { FetchSectorDelegate, ParseSectorDelegate, ConsumeSectorDelegate } from './delegates';
import { LoadSectorStatus, LoadSectorRequest } from './types';

export function loadSector(
  sectorId: number,
  fetchSector: FetchSectorDelegate,
  parseSector: ParseSectorDelegate,
  consumeSector: ConsumeSectorDelegate
): LoadSectorRequest {
  let status = LoadSectorStatus.Awaiting;
  let cancelRequested = false;

  async function load(): Promise<LoadSectorStatus> {
    const data = await fetchSector(sectorId);
    if (cancelRequested) {
      return LoadSectorStatus.Cancelled;
    }
    const sector = await parseSector(sectorId, data);
    if (cancelRequested) {
      return LoadSectorStatus.Cancelled;
    }
    consumeSector(sectorId, sector);
    return LoadSectorStatus.Resolved;
  }
  async function loadAndReport(): Promise<void> {
    status = LoadSectorStatus.InFlight;
    status = await load();
  }

  const result: LoadSectorRequest = {
    promise: loadAndReport(),
    cancel: () => (cancelRequested = true),
    status: () => status
  };
  return result;
}
