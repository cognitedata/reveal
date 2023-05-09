import { createLink } from '@cognite/cdf-utilities';

export const getCanvasLink = (canvasId: string | undefined) =>
  createLink('/explore/industryCanvas', { canvasId });
