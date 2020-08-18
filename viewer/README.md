# Reveal viewer

Documentation for the latest version is available at [https://cognitedata.github.io/reveal/docs/](https://cognitedata.github.io/reveal/docs/)

## Code Example

```typescript
import { Cognite3DViewer } from "@cognite/reveal";
import { CogniteClient } from "@cognite/sdk";

const appId = "com.cognite.reveal.example";
const client = new CogniteClient({ appId });

client.loginWithOAuth({ project: "publicdata" });

const viewer = new Cognite3DViewer({
  sdk: client,
  domElement: document.querySelector("#your-element-for-viewer")
});
viewer.addModel({ modelId: 4715379429968321, revisionId: 5688854005909501 });
```

## Installation

```bash
npm install @cognite/reveal
```

## Coordinate systems

The data served from Cognite Data Fusion is in a right-handed coordinate system with Z up,
X to the right and Y pointing into the screen.

In Three.js, which is supported by the Reveal viewer, the coordinate system is right-handed with
Y up, X to the right and Z pointing out of the screen.

### Conversion between the different coordinate systems

The policy in this repository is to stick with the CDF coordinate system in any code that is not
viewer-specific.
For viewer-specific code, the conversion should happen as early as possible.
