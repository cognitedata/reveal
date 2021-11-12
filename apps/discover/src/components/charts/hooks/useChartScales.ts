import { useMemo } from 'react';

import { scaleBand, scaleLinear } from 'd3-scale';
import compact from 'lodash/compact';
import get from 'lodash/get';
import uniq from 'lodash/uniq';

import {
  Accessors,
  Dimensions,
  Margins,
  ScaleRange,
} from 'components/charts/types';

const RANGE_MIN_SCALE_FACTOR = 0.98;
const RANGE_MAX_SCALE_FACTOR = 1.02;

export const useChartScales = <T>({
  data,
  chartDimensions,
  margins,
  accessors,
  xScaleRange,
  yScaleRange,
  yScaleDomain: yScaleDomainCustom,
  reverseXScaleDomain,
  reverseYScaleDomain,
}: {
  data: T[];
  chartDimensions: Dimensions;
  margins: Margins;
  accessors: Accessors;
  xScaleRange: ScaleRange;
  yScaleRange?: ScaleRange;
  yScaleDomain?: string[];
  reverseXScaleDomain?: boolean;
  reverseYScaleDomain?: boolean;
}) => {
  const [xScaleMinValue, xScaleMaxValue] = xScaleRange;

  const getCalculatedYScaleDomain = () => {
    const yScaleValues = data.map((dataElement) =>
      get(dataElement, accessors.y)
    );
    const yScaleDomain = uniq(compact(yScaleValues));
    return yScaleDomain;
  };

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

  const xScaleDomain = [
    xScaleMinValue * RANGE_MIN_SCALE_FACTOR,
    xScaleMaxValue * RANGE_MAX_SCALE_FACTOR,
  ];

  const yScaleDomain = yScaleRange
    ? [
        yScaleRange[0] * RANGE_MIN_SCALE_FACTOR,
        yScaleRange[1] * RANGE_MAX_SCALE_FACTOR,
      ]
    : yScaleDomainCustom || getCalculatedYScaleDomain();

  const xScale = useMemo(() => {
    return scaleLinear()
      .domain(
        reverseXScaleDomain ? xScaleDomain.slice().reverse() : xScaleDomain
      )
      .range([margins.left, chartDimensions.width - margins.right]);
  }, [xScaleMaxValue, margins, chartDimensions]);

  const yScale = useMemo(() => {
    return yScaleRange ? getYScaleLinear() : getYScaleBand();
  }, [data, chartDimensions]);

  return { xScale, yScale, xScaleDomain, yScaleDomain };
};
