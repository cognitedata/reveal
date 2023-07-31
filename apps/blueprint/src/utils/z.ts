import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',
  'OVERLAY',
  'BLUEPRINT_PAGE_TOPBAR',

  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
];

export default createLayers(LAYERS);
