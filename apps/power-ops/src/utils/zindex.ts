import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',

  //
  // things closer to here are shown on TOP (ie: have high z-index)
  //

  'MIDDLE',

  //
  // things closer to here are shown BELOW
  //

  'MINIMUM',
] as const;

export default createLayers(LAYERS);
