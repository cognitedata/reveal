import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',
  'OVERLAY',

  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
];

export default createLayers<typeof LAYERS[number]>(LAYERS);
