import { createLayers } from '@cognite/z-index';

const LAYERS = ['MAXIMUM', 'MINIMUM'] as const;

export const zIndex = createLayers(LAYERS);
export default zIndex;
