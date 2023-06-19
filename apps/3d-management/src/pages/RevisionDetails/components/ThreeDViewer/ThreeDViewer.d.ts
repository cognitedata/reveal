import { v3 } from '@cognite/cdf-sdk-singleton';

export type ThreeDViewerProps = {
  modelId: number;
  revision: v3.Revision3D;
};
