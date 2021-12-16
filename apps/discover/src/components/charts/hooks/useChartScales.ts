import { useMemo } from 'react';

import { scaleBand, scaleLinear } from 'd3-scale';

import {
  Accessors,
  Dimensions,
  Margins,
  ScaleRange,
} from 'components/charts/types';
import { useCompare } from 'hooks/useCompare';

import { useYScaleDomain } from './useYScaleDomain';

export const useChartScales = <T>({
  data,
  chartDimensions,
  margins,
  accessors,
  xScaleRange,
  yScaleRange,
  yScaleDomainCustom,
  reverseXScaleDomain,
  reverseYScaleDomain,
}: {
  data: T[];
  chartDimensions: Dimensions;
  margins: Margins;
  accessors: Accessors;
  xScaleRange: ScaleRange;
  yScaleRange?: ScaleRange;
  yScaleDomainCustom?: string[];
  reverseXScaleDomain?: boolean;
  reverseYScaleDomain?: boolean;
}) => {
  const calculatedYScaleDomain = useYScaleDomain<T>(
    data,
    accessors.y,
    yScaleDomainCustom
  );

  const yScaleDomain = yScaleRange || calculatedYScaleDomain;

  const getYScaleLinear = () => {
    return scaleLinear()
      .domain(
        reverseYScaleDomain ? yScaleDomain.slice().reverse() : yScaleDomain
      )
      .range([chartDimensions.height - margins.bottom, margins.top]);
  };

  const getYScaleBand = () => {
    return scaleBand()
      .domain(
        reverseYScaleDomain ? yScaleDomain.slice().reverse() : yScaleDomain
      )
      .range([chartDimensions.height - margins.bottom, margins.top]);
  };

  const xScale = useMemo(() => {
    return scaleLinear()
      .domain(reverseXScaleDomain ? xScaleRange.slice().reverse() : xScaleRange)
      .range([margins.left, chartDimensions.width - margins.right]);
  }, useCompare([data, xScaleRange, chartDimensions]));

  const yScale = useMemo(() => {
    return yScaleRange ? getYScaleLinear() : getYScaleBand();
  }, useCompare([data, yScaleDomain, chartDimensions]));

  return useMemo(
    () => ({ xScale, yScale, xScaleDomain: xScaleRange, yScaleDomain }),
    useCompare([xScale, yScale])
  );
};
