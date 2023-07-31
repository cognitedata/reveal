import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',
  //
  // things closer to here are shown on TOP (ie: have high z-index)
  //
  'SELECTED_ANNOTATION',
  'LEFT_SIDEBAR',
  'TILE_ACTIONS_MENU',
  'COLLAPSE_EXPAND_ICON',
  //
  // things closer to here are shown BELOW
  //
  'MINIMUM',
] as const;

export default createLayers(LAYERS);
