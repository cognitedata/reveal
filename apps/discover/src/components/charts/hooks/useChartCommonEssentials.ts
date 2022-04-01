import { useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { useDeepCallback, useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { AxisPlacement, AxisProps, XAxisPlacement } from '../common/Axis';
import { LegendCheckboxState, LegendProps } from '../common/Legend';
import { getLegendInitialCheckboxState } from '../common/Legend/utils';
import {
  DEFAULT_MARGINS,
  DEFAULT_X_AXIS_PLACEMENT,
  DEFAULT_X_AXIS_SPACING,
  DEFAULT_Y_AXIS_SPACING,
} from '../constants';
import { BaseChartOptions, ChartAxis } from '../types';
import {
  filterUndefinedValues,
  getDefaultColorConfig,
  getFilteredData,
  getCalculatedMarginLeft,
} from '../utils';

export const useChartCommonEssentials = <T>({
  dataOriginal,
  xAxis,
  yAxis,
  yAxisExtraProps,
  options,
  onUpdate,
}: {
  dataOriginal: T[];
  xAxis: ChartAxis & XAxisPlacement;
  yAxis: ChartAxis;
  yAxisExtraProps?: Partial<AxisProps>;
  options: BaseChartOptions<T> & any;
  onUpdate?: () => void;
}) => {
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [legendCheckboxState, setLegendCheckboxState] =
    useState<LegendCheckboxState>({});

  const data = useDeepMemo(
    () => filterUndefinedValues<T>(dataOriginal, yAxis.accessor),
    [dataOriginal]
  );

  const margins = {
    ...DEFAULT_MARGINS,
    ...(yAxisExtraProps?.hideAxisTicks
      ? {}
      : { left: getCalculatedMarginLeft<T>(data, yAxis) }),
    ...options?.margins,
  };

  const xAccessor = xAxis.accessor;
  const yAccessor = yAxis.accessor;
  const accessors = { x: xAccessor, y: yAccessor };

  const xAxisPlacement = xAxis.placement || DEFAULT_X_AXIS_PLACEMENT;
  const isXAxisOnTop = xAxisPlacement === AxisPlacement.Top;

  const spacings = {
    x: xAxis.spacing || DEFAULT_X_AXIS_SPACING,
    y: yAxis.spacing || DEFAULT_Y_AXIS_SPACING,
  };

  const colorConfig =
    options?.colorConfig ||
    getDefaultColorConfig(options?.legendOptions?.accessor);

  const isolateLegend = !isUndefined(options?.legendOptions?.isolate)
    ? options?.legendOptions?.isolate
    : true;

  const chartOffsetBottom =
    isolateLegend && options?.legendOptions?.overlay && isXAxisOnTop
      ? spacings.y
      : undefined;

  const initialCheckboxState: LegendCheckboxState = useDeepMemo(() => {
    if (isEmpty(data) || isUndefined(colorConfig)) return {};
    return getLegendInitialCheckboxState<T>(data, colorConfig.accessor);
  }, [data]);

  const onChangeLegendCheckbox = useDeepCallback(
    (option: string, checked: boolean) => {
      if (isUndefined(colorConfig)) return;

      const updatedCheckboxState = {
        ...legendCheckboxState,
        [option]: checked,
      };

      const filteredData = getFilteredData<T>(
        data,
        colorConfig.accessor,
        updatedCheckboxState
      );

      setLegendCheckboxState(updatedCheckboxState);
      setTimeout(() => setFilteredData(filteredData));

      if (onUpdate) onUpdate();
    },
    [data, legendCheckboxState]
  );

  const handleResetToDefault = useDeepCallback(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
    if (onUpdate) onUpdate();
  }, [data]);

  useDeepEffect(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
  }, [data]);

  const legendProps: LegendProps = {
    legendCheckboxState,
    onChangeLegendCheckbox,
    colorConfig,
    isolateLegend,
    legendOptions: options?.legendOptions,
  };

  return useDeepMemo(
    () => ({
      data,
      filteredData,
      margins,
      xAccessor,
      yAccessor,
      accessors,
      xAxisPlacement,
      legendProps,
      colorConfig,
      chartOffsetBottom,
      spacings,
      handleResetToDefault,
    }),
    [data, filteredData, legendCheckboxState]
  );
};
