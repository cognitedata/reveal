import { createLayers } from '@cognite/z-index';

const LAYERS = [
  // tools that need to sit above deselect container in process page
  'TOOLBAR',

  'SIDE_PANEL',

  'BULK_EDIT',

  /** The default z-index for all components */
  'DEFAULT',
  // used for deselect container in process page (contextualization)
  'DESELECT_CONTAINER',

  'MINIMUM',
];

const layers = createLayers<(typeof LAYERS)[number]>(LAYERS);

export { layers as zIndex };
