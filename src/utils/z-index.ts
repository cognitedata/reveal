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
