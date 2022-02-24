export type Domain = [number, number];
export type Tuplet = [number, number];

export type ColumnLogData = {
  measurementType: string;
  values: Tuplet[] | number[];
  unit: string;
  domain: Domain;
};

export type LogData = Record<string, ColumnLogData>;

export type EventData = {
  holeStartValue: number;
  holeEndValue: number;
  riskType?: string;
};
