import { Model3D, Revision3D } from '@cognite/sdk';

export type BasicMapping = {
  modelId: number;
  revisionId: number;
};

export type DetailedMapping = {
  model: Model3D;
  revision: Revision3D;
};

export type ThreeDRevisionOutput = {
  format: string;
  version: number;
  blobId: number;
};
