import { Sector } from "./Sector";

export type LoadSectorRequest =
{
  promise?: Promise<void>;
  cancelCb: () => void;
  statusCb: () => LoadSectorStatus;
}

export enum LoadSectorStatus
{
  Awaiting,
  InFlight,
  Cancelled,
  Resolved,
}

export type FetchSectorDelegate = (sectorId: number) => Promise<ArrayBuffer>;
export type ParseSectorDelegate = (sectorId: number, buffer: ArrayBuffer) => Promise<Sector>;
export type ConsumeSectorDelegate = (sector: Sector) => void;

export function loadSector(sectorId: number, fetchSector: FetchSectorDelegate, parseSector: ParseSectorDelegate, consumeSector: ConsumeSectorDelegate): LoadSectorRequest {
  let cancelRequested = false;
  let status = LoadSectorStatus.Awaiting;
  const result = { promise: undefined, cancelCb: () => cancelRequested = true, statusCb: () => status };
  async function loadSectorAsync(): Promise<void> {
    status = LoadSectorStatus.InFlight;
    if (cancelRequested) {
      status = LoadSectorStatus.Cancelled;
      return;
    }
    const data = await fetchSector(sectorId);
    if (cancelRequested) {
      status = LoadSectorStatus.Cancelled;
      return;
    }
    const sector = await parseSector(sectorId, data);
    if (cancelRequested) {
      status = LoadSectorStatus.Cancelled;
      return;
    }
    status = LoadSectorStatus.Resolved;
    consumeSector(sector);
  }
  result.promise = loadSectorAsync();
  return result;
}
