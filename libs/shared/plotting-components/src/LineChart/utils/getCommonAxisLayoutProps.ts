import isUndefined from 'lodash/isUndefined';
import { LayoutAxis } from 'plotly.js';

import { Axis, AxisIdentifier, Layout } from '../types';

import { getBooleanFromAxisDirection } from './getBooleanFromAxisDirection';

export const getCommonAxisLayoutProps = (
  id: AxisIdentifier,
  axis: Axis | undefined,
  layout: Layout
): Partial<LayoutAxis> => {
  const { showAxisNames, showTickLabels } = layout;
  const showAxisName = getBooleanFromAxisDirection(showAxisNames, id);

  return {
    title: showAxisName ? { text: axis?.name } : undefined,
    showticklabels: getBooleanFromAxisDirection(showTickLabels, id),
    dtick: axis?.tickDistance,
    tickangle: isUndefined(axis?.tickCount) ? 0 : undefined,
    zeroline: false,
    showline: true,
    mirror: true,
  };
};
