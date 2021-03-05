import { createLayers } from '@cognite/z-index';

const LAYERS = [
  'MAXIMUM', // 10000
  'POPOVER', // 1100
  'BOTTOM_ROW', // 1051
  'SIDEBAR', // 1001
  'MEDIUM', // 1000
  'MINIMUM', // 1
] as const;

export default createLayers<typeof LAYERS[number]>(LAYERS);
