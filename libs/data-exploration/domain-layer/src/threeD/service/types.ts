import { Model3D, Revision3D } from '@cognite/sdk';

export type BasicMapping = {
  modelId: number;
  nodeId: number;
  revisionId: number;
};

export type DetailedMapping = BasicMapping & {
  model: Model3D;
  revision: Revision3D;
};
