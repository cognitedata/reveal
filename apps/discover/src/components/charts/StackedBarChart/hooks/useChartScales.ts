import { useMemo } from 'react';

import { scaleBand, scaleLinear } from 'd3-scale';
import uniq from 'lodash/uniq';

import { Dimensions, Margins } from '../types';

export const useChartScales = <T>({
  data,
  chartDimensions,
  margins,
  xScaleMaxValue,
  yAccessor,
  yScaleDomain: yScaleDomainOriginal,
}: {
  data: T[];
  chartDimensions: Dimensions;
  margins: Margins;
  xScaleMaxValue: number;
  yAccessor: keyof T;
  yScaleDomain?: string[];
}) => {
  const xScaleDomain = [0, xScaleMaxValue];

  const yScaleDomainData =
    yScaleDomainOriginal ||
    data.map((dataElement) => String(dataElement[yAccessor]));

  const yScaleDomain = uniq(yScaleDomainData);

  const xScale = useMemo(() => {
    return scaleLinear()
      .domain(xScaleDomain)
      .range([margins.left, chartDimensions.width - margins.right]);
  }, [xScaleMaxValue, margins, chartDimensions]);

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(yScaleDomain.slice().reverse())
      .range([chartDimensions.height - margins.bottom, margins.top]);
  }, [data, chartDimensions]);

  return { xScale, yScale, xScaleDomain, yScaleDomain };
};
