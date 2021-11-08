import { RefObject, useCallback, useEffect, useState } from 'react';

import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { Dimensions, Margins } from 'components/charts/types';
import { useDebounce } from 'hooks/useDebounce';

import { getStylePropertyValue } from '../utils';

import { useXScaleMaxValue } from './useXScaleMaxValue';

const UNINITIALIZED_CHART_DIMENTIONS: Dimensions = { height: 0, width: 0 };

export const useZoomableChart = <T>({
  data,
  chartRef,
  margins,
  accessors,
  spacings,
  zoomStepSize,
}: {
  data: T[];
  chartRef: RefObject<HTMLDivElement>;
  margins: Margins;
  accessors: { x: string; y: string };
  spacings: { x: number; y: number };
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

  const xScaleMaxValue = useXScaleMaxValue<T>({
    data,
    accessors,
  });

  const yAxisUniqueElementsCount = uniq(
    data.map((dataElement) => get(dataElement, accessors.y))
  ).length;

  useEffect(() => {
    if (!chartRef) return;

    const height = spacings.y * yAxisUniqueElementsCount;

    const width =
      parseInt(getStylePropertyValue(chartRef, 'width'), 10) -
      parseInt(getStylePropertyValue(chartRef, 'padding'), 10) -
      margins.left -
      margins.right;

    const dimensions = { height, width };

    setInitialChartDimensions(dimensions);
    setChartDimensions(dimensions);
    setZoomFactor(1);
  }, [yAxisUniqueElementsCount, xScaleMaxValue]);

  useEffect(() => {
    setDisableZoomIn(chartDimensions.width >= spacings.x * xScaleMaxValue);
    setDisableZoomOut(chartDimensions.width === initialChartDimensions.width);
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

  const resetZoom = useCallback(() => {
    setChartDimensions(initialChartDimensions);
    setZoomFactor(1);
  }, [initialChartDimensions]);

  return {
    chartDimensions,
    zoomIn,
    zoomOut,
    resetZoom,
    disableZoomIn,
    disableZoomOut,
    zoomFactor,
  };
};
