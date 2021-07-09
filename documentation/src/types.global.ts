import { Cognite3DModel, CognitePointCloudModel, Cognite3DViewer } from '@cognite/reveal';
import CogniteClient from "@cognite/sdk/dist/src/cogniteClient";

declare global {
  interface Window {
    viewer?: Cognite3DViewer;
    model?: Cognite3DModel | CognitePointCloudModel
    sdk?: CogniteClient
  }
}

export {};
