import { LayoutAxis } from 'plotly.js';
import isUndefined from 'lodash/isUndefined';

import { Axis, Layout } from '../types';

export const getCommonAxisLayoutProps = (
  axis: Axis | undefined,
  layout: Layout = {}
): Partial<LayoutAxis> => {
  const { showAxisNames, showTickLabels } = layout;

  return {
    title: showAxisNames ? { text: axis?.name } : undefined,
    dtick: axis?.tickDistance,
    tickangle: isUndefined(axis?.tickCount) ? 0 : undefined,
    showticklabels: showTickLabels,
    zeroline: false,
    showline: true,
    mirror: true,
  };
};
