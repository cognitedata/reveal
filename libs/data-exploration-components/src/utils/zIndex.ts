import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',

  'DRAWER',
  'OVERLAY',

  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
] as const;

export const zIndex = createLayers(LAYERS);
export default zIndex;
