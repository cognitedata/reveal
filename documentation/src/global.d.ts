import { Cognite3DModel } from "@cognite/reveal";
import { Cognite3DViewer } from "@cognite/reveal";
import { CogniteClient } from "@cognite/sdk/dist/src";

declare global {
    interface Window { model?: Cognite3DModel; viewer?: Cognite3DViewer; sdk?: CogniteClient }
}

export {}
