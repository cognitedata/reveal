/*!
 * Copyright 2022 Cognite AS
 */

export type EptSchemaEntry = {
  name: string;
  type: 'signed' | 'unsigned' | 'float';
  size: number;
  scale: number;
  offset: number;
};

export type SpatialReferenceSystem = {
  authority: string;
  horizontal: string;
  vertical?: string;
  wkt: string;
};

export type EptJson = {
  schema: EptSchemaEntry[];
  bounds: number[];
  boundsConforming: number[];
  ticks: number;
  srs?: SpatialReferenceSystem;
  span?: number;
  dataType: 'binary' | 'laszip';
};
