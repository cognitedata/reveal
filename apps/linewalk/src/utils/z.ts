import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',
  'OVERLAY',
  'ISO_MODAL',
  'DISCREPANCY_MODAL',
  'LINE_REVIEW_VIEWER_BUTTONS',
  'LIST_TOOL_OVERLAY',

  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
];

export default createLayers(LAYERS);
