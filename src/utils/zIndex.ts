import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',

  //
  // things closer to here are shown on TOP (ie: have high z-index)
  //

  'BULK_ACTION',

  //
  // things closer to here are shown BELOW
  //

  'MINIMUM',
] as const;

export default createLayers<typeof LAYERS[number]>(LAYERS);
