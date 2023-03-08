import { DEFAULT_MARGIN } from '../constants';
import { Layout } from '../types';

export const getMarginBottom = (layout: Layout) => {
  const { showAxisNames, showTickLabels } = layout;

  if (showAxisNames && showTickLabels) {
    return 50;
  }

  if (!showAxisNames && showTickLabels) {
    return 16;
  }

  if (showAxisNames && !showTickLabels) {
    return 24;
  }

  return DEFAULT_MARGIN;
};
