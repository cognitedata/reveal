export type Facility = {
  id: string;
  path: string;
  name: string;
  shortName: string;
  unitPattern?: RegExp;
  env: string[];
};
