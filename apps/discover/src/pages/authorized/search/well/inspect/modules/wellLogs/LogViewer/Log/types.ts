export type Domain = [number, number];
export type Tuplet = [number, number];

export type WellLogPreviewDataColumn = {
  measurementType: string;
  values: Tuplet[] | number[];
  unit: string;
  domain: Domain;
  color: string;
};

export type WellLogPreviewData = Record<string, WellLogPreviewDataColumn>;

export type WellLogNdsEventsData = {
  holeStartValue: number;
  holeEndValue: number;
  riskType?: string;
};
