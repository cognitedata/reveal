import { v3 } from '@cognite/cdf-sdk-singleton';

export type ThreeDViewerProps = {
  modelId: string;
  revision: v3.Revision3D;
  ViewerConstructor:
    | typeof import('@cognite/reveal').Cognite3DViewer
    | typeof import('@cognite/3d-viewer').Cognite3DViewer;
};
