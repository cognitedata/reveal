import {
  AXIS_TITLE_MARGIN,
  DEFAULT_MARGIN,
  TICK_LABEL_PADDING,
} from '../constants';
import { Layout } from '../types';

import { getBooleanFromAxisDirection } from './getBooleanFromAxisDirection';
import { getMaxYTickLength } from './getMaxYTickLength';

export const getMarginLeft = (
  layout: Layout,
  graph: HTMLElement | null,
  hasAxisLabel: boolean
) => {
  const { showAxisNames, showTickLabels } = layout;

  const showAxisTitle = hasAxisLabel && showAxisNames;
  const showYAxisTickLabels = getBooleanFromAxisDirection(showTickLabels, 'y');

  const maxYTickLength = getMaxYTickLength(graph);
  const tickMargin = Math.ceil(maxYTickLength);

  if (showAxisTitle && showYAxisTickLabels) {
    return AXIS_TITLE_MARGIN + TICK_LABEL_PADDING + tickMargin;
  }

  if (!showAxisTitle && showYAxisTickLabels) {
    return TICK_LABEL_PADDING + tickMargin;
  }

  if (showAxisTitle && !showYAxisTickLabels) {
    return AXIS_TITLE_MARGIN;
  }

  return DEFAULT_MARGIN;
};
