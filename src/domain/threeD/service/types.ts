import { Model3D } from '@cognite/sdk';

export type BasicMapping = {
  modelId: number;
  nodeId: number;
  revisionId: number;
};

export type DetailedMapping = {
  model: Model3D;
  nodeId: number;
  revisionId: number;
};
