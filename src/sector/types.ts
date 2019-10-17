export class Sector {}

export interface SectorMetadata {
  id: number;
  children: SectorMetadata[];
}
