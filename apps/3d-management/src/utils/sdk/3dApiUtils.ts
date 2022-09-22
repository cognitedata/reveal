export interface RevisionLog3D {
  timestamp: number;
  severity: 3 | 5 | 7;
  type: string;
  info: string;
}

export type NodePropertyFilterType = {
  [category: string]: {
    [key: string]: string;
  };
};
