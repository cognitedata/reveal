# @cognite/z-index

A tiny utility to bring sanity to `z-index`.
This is best-paired with `@cognite/eslint-plugin` and the rules:

- `@cognite/no-number-z-index-inline-styling`
- `@cognite/no-number-z-index-property`
- `@cognite/no-number-z-index-styled-components`

## Usage

Create a file (`utils/zindex.ts`) with content like the following:

```js
import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',

  // Insert your other levels here, ordered how they should be ordered in the
  // z-order hierarchy.
  'ALERT_POPUP',
  'TOOLTIP',
  'DROPDOWN',
  'MODAL_OVERLAY',
  // ...

  'MINIMUM',
] as const;

export default createLayers<typeof LAYERS[number]>(LAYERS);
```

Then, when setting a component's z-index ordering, utilize it like so:

```js
import styled from 'styled-components';
import Layers from 'utils/zindex';

const DemoComponent = () => {
  // This just demonstrates that it works both in styled components and in
  // inline-styled components.
  return (
    <div>
      <ModalOverlay />
      <div style={{ zIndex: Layers.ALERT_POPUP }}>Alert pop-up</div>
    </div>
  );
};

const ModalOverlay = styled.div`
  z-index: ${Layers.MODAL_OVERLAY};
`;

export default DemoComponent;
```

Note that you should probably never use `MAXIMUM` or `MINIMUM` in your code.
If you find yourself tempted to use `MAXIMUM`, just create a new constant and put it directly below `MAXIMUM`.

If you know TypeScript well enough to get rid of that `<typeof LAYERS[number]>` generic, please submit a PR! :grinning:
