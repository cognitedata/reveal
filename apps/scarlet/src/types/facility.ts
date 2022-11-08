export type Facility = {
  id: string;
  path: string;
  name: string;
  shortName: string;
  datasetId: number;
  unitPattern?: RegExp;
  env: string[];
};
