import { createLayers } from '@cognite/z-index';

const LAYERS = ['MAXIMUM', 'CHAT', 'OVERLAY', 'BUTTON', 'MINIMUM'] as const;

export const zIndex = createLayers(LAYERS);
export default zIndex;
