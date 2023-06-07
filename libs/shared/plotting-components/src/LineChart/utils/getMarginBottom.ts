import {
  AXIS_TITLE_MARGIN,
  DEFAULT_MARGIN,
  TICK_LABEL_PADDING,
} from '../constants';
import { Layout } from '../types';

import { getBooleanFromAxisDirection } from './getBooleanFromAxisDirection';
import { getMaxXTickHeight } from './getMaxXTickHeight';

export const getMarginBottom = (
  layout: Layout,
  graph: HTMLElement | null,
  hasAxisLabel: boolean
) => {
  const { showAxisNames, showTickLabels } = layout;

  const showAxisTitle = hasAxisLabel && showAxisNames;
  const showXAxisTickLabels = getBooleanFromAxisDirection(showTickLabels, 'x');

  const maxXTickHeight = getMaxXTickHeight(graph);
  const tickMargin = Math.ceil(maxXTickHeight);

  if (showAxisTitle && showXAxisTickLabels) {
    return AXIS_TITLE_MARGIN + TICK_LABEL_PADDING + tickMargin;
  }

  if (!showAxisTitle && showXAxisTickLabels) {
    return TICK_LABEL_PADDING + tickMargin;
  }

  if (showAxisTitle && !showXAxisTickLabels) {
    return AXIS_TITLE_MARGIN;
  }

  return DEFAULT_MARGIN;
};
