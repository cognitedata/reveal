# Reveal viewer

Documentation for the latest version is available at [https://cognitedata.github.io/reveal/docs/](https://cognitedata.github.io/reveal/docs/)

We have [demos here](https://cognitedata.github.io/reveal/docs/examples/cad-basic)!

---

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

There are 2 different types of projects:

1. These where CDN is available (no restrictive Content-Security-Policy is set)
2. Projects with [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
that forbids to fetch scripts from jsdeliver.

By default, the reveal will try to fetch its worker/wasm files from [jsdeliver](https://cdn.jsdelivr.net/npm/@cognite/reveal-parser-worker@1.0.0/dist/cdn/).
If there is no CSP in your project, then it will just work without any additional steps.

In case if you see an error like that:

> Refused to load the script 'https://cdn.jsdelivr.net/npm/@cognite/reveal-parser-worker@1.0.0/dist/cdn/reveal.parser.worker.js' because it violates the following Content Security Policy directive: "script-src 'self' https://localhost:* blob:"

See the next steps in our [documentation](https://cognitedata.github.io/reveal/docs/installation#installation-for-projects-with-csp).
