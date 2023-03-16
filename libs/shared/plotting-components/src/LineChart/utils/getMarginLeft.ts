import last from 'lodash/last';

import { DEFAULT_MARGIN } from '../constants';
import { Layout } from '../types';
import { getBooleanFromAxisDirection } from './getBooleanFromAxisDirection';
import { getTickTextWidth } from './getTickTextWidth';

export const getMarginLeft = (
  layout: Layout,
  graph: HTMLElement | null,
  hasAxisLabel: boolean
) => {
  const { showAxisNames, showTickLabels } = layout;
  const showYAxisTickLabels = getBooleanFromAxisDirection(showTickLabels, 'y');

  const yticks = graph?.getElementsByClassName('ytick');
  const yTickWithMaxWidth = last(yticks);
  const maxYTickLength = getTickTextWidth(yTickWithMaxWidth?.textContent);

  if (hasAxisLabel && showAxisNames && showYAxisTickLabels) {
    return maxYTickLength + 32;
  }

  if ((!hasAxisLabel || !showAxisNames) && showYAxisTickLabels) {
    return maxYTickLength + 24;
  }

  if (hasAxisLabel && showAxisNames && !showYAxisTickLabels) {
    return 24;
  }

  return DEFAULT_MARGIN;
};
