import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',
  'SEARCH',
  'PAGE_HEADER',
  'DEFAULT',
  'MINIMUM',
] as const;

export const zIndex = createLayers(LAYERS);
