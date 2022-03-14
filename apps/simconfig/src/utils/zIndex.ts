import { createLayers } from '@cognite/z-index';

export const LAYER = createLayers([
  'TOP',

  'TOOLTIP',
  'DEFAULT',

  'BOTTOM',
] as const);
