import { DEFAULT_MARGIN } from '../constants';
import { Layout } from '../types';

export const getMarginBottom = (layout: Layout, hasAxisLabel: boolean) => {
  const { showAxisNames, showTickLabels } = layout;

  if (hasAxisLabel && showAxisNames && showTickLabels) {
    return 50;
  }

  if ((!hasAxisLabel || !showAxisNames) && showTickLabels) {
    return 18;
  }

  if (hasAxisLabel && showAxisNames && !showTickLabels) {
    return 24;
  }

  return DEFAULT_MARGIN;
};
