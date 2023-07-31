export type Cluster = {
  value: string;
  label: string;
  legacyAuth?: boolean;
};
export type ClusterGroup = {
  label: string;
  options: Cluster[];
};
