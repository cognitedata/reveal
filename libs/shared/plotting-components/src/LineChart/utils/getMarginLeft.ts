import last from 'lodash/last';

import { DEFAULT_MARGIN } from '../constants';
import { Layout } from '../types';
import { getTickTextWidth } from './getTickTextWidth';

export const getMarginLeft = (layout: Layout, graph: HTMLElement | null) => {
  const { showAxisNames, showTickLabels } = layout;

  const yticks = graph?.getElementsByClassName('ytick');
  const yTickWithMaxWidth = last(yticks);
  const maxYTickLength = getTickTextWidth(yTickWithMaxWidth?.textContent);

  if (showAxisNames && showTickLabels) {
    return maxYTickLength + 32;
  }

  if (!showAxisNames && showTickLabels) {
    return maxYTickLength + 8;
  }

  if (showAxisNames && !showTickLabels) {
    return 24;
  }

  return DEFAULT_MARGIN;
};
