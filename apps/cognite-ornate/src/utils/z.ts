import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',
  'OVERLAY',
  'LIST_TOOL_OVERLAY',

  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
];

export default createLayers(LAYERS);
