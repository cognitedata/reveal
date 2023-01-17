import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',

  'OVERLAY',

  /** The default z-index for all components */
  'DEFAULT',

  'FILTER',

  'MINIMUM',
] as const;

export const zIndex = createLayers(LAYERS);
export default zIndex;
