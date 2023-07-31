# @cognite/sidecar

This package provides the source of truth for your sidecar types.

It also provides a helper so you can easily setup for your local sidecar.

## Installation

```sh
yarn add @cognite/sidecar
```

## Usage

In your apps `sidecar.ts` file:

```js
import { SidecarConfig, getDefaultSidecar } from '@cognite/sidecar';

(window as any).__cogniteSidecar = {
  ...getDefaultSidecar({
    prod: false,
    cluster: 'azure-dev',
  }),

  ... your other settings ...

  ...((window as any).__cogniteSidecar || {}),
};

export default (window as any).__cogniteSidecar as SidecarConfig;
```

Happy hacking!
