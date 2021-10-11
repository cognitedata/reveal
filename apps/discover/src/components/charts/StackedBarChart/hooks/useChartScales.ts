import { useMemo } from 'react';

import { scaleBand, scaleLinear } from 'd3-scale';
import get from 'lodash/get';

import { Axis, Dimensions, Margins } from '../types';

export const useChartScales = <T>({
  data,
  chartDimensions,
  margins,
  xScaleMaxValue,
  yAxis,
}: {
  data: T[];
  chartDimensions: Dimensions;
  margins: Margins;
  xScaleMaxValue: number;
  yAxis: Axis;
}) => {
  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([0, xScaleMaxValue])
        .range([margins.left, chartDimensions.width - margins.right]),
    [xScaleMaxValue, margins, chartDimensions]
  );

  const yScale = useMemo(
    () =>
      scaleBand()
        .domain(data.map((dataElement) => get(dataElement, yAxis.accessor)))
        .range([chartDimensions.height - margins.bottom, margins.top]),
    [data, chartDimensions]
  );

  return { xScale, yScale };
};
