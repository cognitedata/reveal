import { createLayers } from '@cognite/z-index';

const LAYERS = [
  // used for Thumbnail overlay btn that open 3d viewer
  'THREED_VIEWER_OVERLAY_BUTTON',

  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
];

export default createLayers<typeof LAYERS[number]>(LAYERS);
