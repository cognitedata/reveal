import { createLayers } from '@cognite/z-index';

export const LAYER = createLayers([
  'TOP',

  'TOOLTIP',
  'DEFAULT',
  'WIZARD_PROGRESS_CONTAINER',
  'CALCULATION_CONFIGURATION_HEADER',

  'BOTTOM',
] as const);
