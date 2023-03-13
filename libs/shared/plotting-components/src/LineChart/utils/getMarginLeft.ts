import last from 'lodash/last';

import { DEFAULT_MARGIN } from '../constants';
import { Layout } from '../types';
import { getTickTextWidth } from './getTickTextWidth';

export const getMarginLeft = (
  layout: Layout,
  graph: HTMLElement | null,
  hasAxisLabel: boolean
) => {
  const { showAxisNames, showTickLabels } = layout;

  const yticks = graph?.getElementsByClassName('ytick');
  const yTickWithMaxWidth = last(yticks);
  const maxYTickLength = getTickTextWidth(yTickWithMaxWidth?.textContent);

  if (hasAxisLabel && showAxisNames && showTickLabels) {
    return maxYTickLength + 32;
  }

  if ((!hasAxisLabel || !showAxisNames) && showTickLabels) {
    return maxYTickLength + 8;
  }

  if (hasAxisLabel && showAxisNames && !showTickLabels) {
    return 24;
  }

  return DEFAULT_MARGIN;
};
