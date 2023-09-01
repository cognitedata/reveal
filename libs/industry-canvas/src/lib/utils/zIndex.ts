import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',
  'POPUP',

  'TOOLBAR',
  'INDICATOR',
  /** The default z-index for all components */
  'DEFAULT',

  'MODAL_CONTENT',
  'MINIMUM',
] as const;

export const zIndex = createLayers(LAYERS);
export default zIndex;
