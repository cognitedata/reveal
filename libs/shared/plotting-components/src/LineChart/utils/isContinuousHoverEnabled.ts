import { HoverMode } from '../types';

export const isContinuousHoverEnabled = (hoverMode: HoverMode) => {
  return hoverMode === 'x';
};
