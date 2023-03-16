import { DEFAULT_MARGIN } from '../constants';
import { Layout } from '../types';
import { getBooleanFromAxisDirection } from './getBooleanFromAxisDirection';

export const getMarginBottom = (layout: Layout, hasAxisLabel: boolean) => {
  const { showAxisNames, showTickLabels } = layout;
  const showXAxisTickLabels = getBooleanFromAxisDirection(showTickLabels, 'x');

  if (hasAxisLabel && showAxisNames && showXAxisTickLabels) {
    return 50;
  }

  if ((!hasAxisLabel || !showAxisNames) && showXAxisTickLabels) {
    return 18;
  }

  if (hasAxisLabel && showAxisNames && !showXAxisTickLabels) {
    return 24;
  }

  return DEFAULT_MARGIN;
};
