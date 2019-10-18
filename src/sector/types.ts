/*!
 * Copyright 2019 Cognite AS
 */

export class Sector {}

export interface SectorMetadata {
  id: number;
  children: SectorMetadata[];
}
