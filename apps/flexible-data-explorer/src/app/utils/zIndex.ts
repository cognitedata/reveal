import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM',

  'POPOVER',

  'COPILOT',

  'SEARCH',

  'THREED_SEARCH_PANEL_BUTTON',

  'PAGE_HEADER',
  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
] as const;

export const zIndex = createLayers(LAYERS);
export default zIndex;
