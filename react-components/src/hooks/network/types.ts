export type OutputTypes =
  | 'model-from-points:1'
  | 'tiles-directory:1'
  | 'ept-pointcloud:1'
  | 'ciff-partially-processed:0'
  | 'ciff-processed:0'
  | 'node-property-metadata-json:0'
  | 'reveal-directory:8'
  | 'gltf-directory:9';

export type LatestRevisionInfoResponse = {
  lastRevisionInfo?: {
    revisionId: number;
    createdTime: number;
    revisionCount: number;
    types?: OutputTypes[];
  };
};

export type ModelWithRevisionInfo = {
  id: number;
  sourceType: string;
  resourceType: string;
  displayName: string;
  createdTime: Date;
  lastUpdatedTime: Date;
  revisionCount: number;
  latestRevisionInfo?: {
    sourceType: string;
    id: number;
    createdTime: Date;
  };
};
