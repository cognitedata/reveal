import { useMemo } from 'react';

import { scaleBand, scaleLinear } from 'd3-scale';
import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { Dimensions, Margins } from 'components/charts/types';

import { useXScaleMaxValue } from './useXScaleMaxValue';

export const useChartScales = <T>({
  data,
  chartDimensions,
  margins,
  accessors,
  xScaleMinValue,
  xScaleMaxValue,
  yScaleDomain: yScaleDomainOriginal,
}: {
  data: T[];
  chartDimensions: Dimensions;
  margins: Margins;
  accessors: { x: string; y: string };
  xScaleMinValue?: number;
  xScaleMaxValue?: number;
  yScaleDomain?: string[];
}) => {
  const xScaleDomain = [
    xScaleMinValue || 0,
    xScaleMaxValue ||
      useXScaleMaxValue<T>({
        data,
        accessors,
      }),
  ];

  const yScaleDomainData =
    yScaleDomainOriginal ||
    data.map((dataElement) => String(get(dataElement, accessors.y)));

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
