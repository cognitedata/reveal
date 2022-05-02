import { RefObject, useState } from 'react';

import { Accessors, Dimensions, Margins } from 'components/Charts/types';
import { useDebounce } from 'hooks/useDebounce';
import { useDeepCallback, useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { getStylePropertyValue } from '../utils';

import { useYScaleDomain } from './useYScaleDomain';

const UNINITIALIZED_CHART_DIMENTIONS: Dimensions = { height: 0, width: 0 };

export const useZoomableChart = <T>({
  data,
  chartRef,
  margins,
  accessors,
  spacings,
  xScaleMaxValue,
  yScaleDomainCustom,
  zoomStepSize,
}: {
  data: T[];
  chartRef: RefObject<HTMLDivElement>;
  margins: Margins;
  accessors: Accessors;
  spacings: { x: number; y: number };
  xScaleMaxValue: number;
  yScaleDomainCustom?: string[];
  zoomStepSize: number;
}) => {
  const [initialChartDimensions, setInitialChartDimensions] =
    useState<Dimensions>(UNINITIALIZED_CHART_DIMENTIONS);
  const [chartDimensions, setChartDimensions] = useState<Dimensions>(
    UNINITIALIZED_CHART_DIMENTIONS
  );
  const [disableZoomIn, setDisableZoomIn] = useState<boolean>(false);
  const [disableZoomOut, setDisableZoomOut] = useState<boolean>(false);
  const [zoomFactor, setZoomFactor] = useState<number>(1);

  const yScaleDomain = useYScaleDomain<T>(
    data,
    accessors.y,
    yScaleDomainCustom
  );

  useDeepEffect(() => {
    if (!chartRef) return;

    const height = spacings.y * yScaleDomain.length;

    const width =
      parseInt(getStylePropertyValue(chartRef, 'width'), 10) -
      parseInt(getStylePropertyValue(chartRef, 'padding-left'), 10) -
      parseInt(getStylePropertyValue(chartRef, 'padding-right'), 10) -
      margins.left -
      margins.right;

    const dimensions = { height, width };

    setInitialChartDimensions(dimensions);
    setChartDimensions(dimensions);
    setZoomFactor(1);
  }, [yScaleDomain, xScaleMaxValue]);

  useDeepEffect(() => {
    /**
     * Sometimes, `xScaleMaxValue` is returned as `Infinite`.
     * In such cases, the zoom out function should not be disabled.
     * This return of `Infinite` is from `d3-scale` side and out of our control.
     */
    const disableZoomIn =
      Number.isFinite(xScaleMaxValue) &&
      chartDimensions.width >= spacings.x * xScaleMaxValue;

    const disableZoomOut =
      chartDimensions.width <= initialChartDimensions.width;

    setDisableZoomIn(disableZoomIn);
    setDisableZoomOut(disableZoomOut);
  }, [chartDimensions]);

  const zoomIn = useDebounce(() => {
    setChartDimensions((currentDimensions) => ({
      ...currentDimensions,
      width: currentDimensions.width + zoomStepSize,
    }));
    setZoomFactor((currentFactor) => currentFactor + 1);
  }, 50);

  const zoomOut = useDebounce(() => {
    setChartDimensions((currentDimensions) => ({
      ...currentDimensions,
      width: currentDimensions.width - zoomStepSize,
    }));
    setZoomFactor((currentFactor) => currentFactor - 1);
  }, 50);

  const resetZoom = useDeepCallback(() => {
    setChartDimensions(initialChartDimensions);
    setZoomFactor(1);
  }, [initialChartDimensions]);

  return useDeepMemo(
    () => ({
      chartDimensions,
      zoomIn,
      zoomOut,
      resetZoom,
      disableZoomIn,
      disableZoomOut,
      zoomFactor,
    }),
    [chartDimensions, disableZoomIn, disableZoomOut, zoomFactor]
  );
};
