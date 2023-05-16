import { Model3D } from '@cognite/sdk/dist/src';

export type ThreeDModelsResponse = {
  items: Model3D[];
  nextCursor?: string;
};
