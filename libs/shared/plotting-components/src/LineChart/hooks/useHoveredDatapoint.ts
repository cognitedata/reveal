import { useMemo } from 'react';

import head from 'lodash/head';
import { PlotHoverEvent } from 'plotly.js';

import { getHoveredLineColor } from '../utils/getHoveredLineColor';
import { getMarkerPosition } from '../utils/getMarkerPosition';

export const useHoveredDatapoint = (plotHoverEvent?: PlotHoverEvent) => {
  const point = head(plotHoverEvent?.points);

  return useMemo(() => {
    const position = getMarkerPosition(plotHoverEvent);
    const color = getHoveredLineColor(plotHoverEvent);

    return {
      position,
      color,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point?.curveNumber, point?.pointNumber]);
};
