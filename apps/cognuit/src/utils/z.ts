import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',

  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
];

export default createLayers(LAYERS);
