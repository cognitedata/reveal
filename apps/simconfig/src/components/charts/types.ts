export type DatumType = OrdinalDatum | TemporalDatum;

export interface OrdinalDatum {
  x: number;
  y: number;
}

export interface TemporalDatum {
  timestamp: Date;
  value: number;
}
