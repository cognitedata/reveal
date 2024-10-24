import { CogniteModel, CognitePointCloudModel, Cognite3DViewer } from '@cognite/reveal';
import { type CogniteClient } from "@cognite/sdk";

declare global {
  interface Window {
    viewer?: Cognite3DViewer;
    model?: CogniteModel | CognitePointCloudModel;
    sdk?: CogniteClient;
  }
}

export {};
