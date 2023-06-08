import { createLink } from '@cognite/cdf-utilities';

export const getCanvasLink = (
  canvasId: string | undefined,
  queries?: Record<string, string>
) => createLink('/industrial-canvas/canvas', { ...queries, canvasId });
