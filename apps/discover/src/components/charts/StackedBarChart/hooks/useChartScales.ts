import { useMemo } from 'react';

import { scaleBand, scaleLinear } from 'd3-scale';

import { Dimensions, Margins } from '../types';

export const useChartScales = <T>({
  data,
  chartDimensions,
  margins,
  xScaleMaxValue,
  yAccessor,
  yScaleDomain,
}: {
  data: T[];
  chartDimensions: Dimensions;
  margins: Margins;
  xScaleMaxValue: number;
  yAccessor: keyof T;
  yScaleDomain?: string[];
}) => {
  const xScale = useMemo(() => {
    return scaleLinear()
      .domain([0, xScaleMaxValue])
      .range([margins.left, chartDimensions.width - margins.right]);
  }, [xScaleMaxValue, margins, chartDimensions]);

  const yScale = useMemo(() => {
    const domain =
      yScaleDomain || data.map((dataElement) => String(dataElement[yAccessor]));

    return scaleBand()
      .domain(domain.slice().reverse())
      .range([chartDimensions.height - margins.bottom, margins.top]);
  }, [data, chartDimensions]);

  return { xScale, yScale };
};
