import { RefObject, useCallback, useEffect, useState } from 'react';

import { useDebounce } from 'hooks/useDebounce';

import { Dimensions, GroupedData, Margins } from '../types';
import { getStylePropertyValue } from '../utils';

const UNINITIALIZED_CHART_DIMENTIONS: Dimensions = { height: 0, width: 0 };

export const useZoomableChart = <T>({
  chartRef,
  groupedData,
  margins,
  spacings,
  xScaleMaxValue,
  zoomStepSize,
}: {
  chartRef: RefObject<HTMLDivElement>;
  groupedData: GroupedData<T>;
  margins: Margins;
  spacings: { x: number; y: number };
  xScaleMaxValue: number;
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

  useEffect(() => {
    if (!chartRef) return;

    const height = spacings.y * Object.keys(groupedData).length;

    const width =
      parseInt(getStylePropertyValue(chartRef, 'width'), 10) -
      parseInt(getStylePropertyValue(chartRef, 'padding'), 10) -
      margins.left -
      margins.right;

    const dimensions = { height, width };

    setInitialChartDimensions(dimensions);
    setChartDimensions(dimensions);
    setZoomFactor(1);
  }, [groupedData, xScaleMaxValue]);

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
