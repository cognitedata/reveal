import { filterChartDataByMeasurementTypeParent } from 'domain/wells/measurements/internal/selectors/filterChartDataByMeasurementTypeParent';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn, ColumnVisibilityProps } from '../../types';
import { adaptMeasurementsDataToChart } from '../../utils/adaptMeasurementsDataToChart';
import {
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
} from '../constants';

import {
  CHART_TITLE,
  EMPTY_MEASUREMENTS_DATA_TEXT,
  PRESSURE_UNIT,
} from './constants';

export interface MeasurementsColumnProps extends ColumnVisibilityProps {
  data?: DepthMeasurementWithData;
  isLoading?: boolean;
  scaleBlocks: number[];
  measurementTypesSelection?: BooleanMap;
}

export const MeasurementsColumn: React.FC<
  WithDragHandleProps<MeasurementsColumnProps>
> = React.memo(
  ({
    data,
    isLoading,
    scaleBlocks,
    measurementTypesSelection,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const { data: depthUnit } = useUserPreferencesMeasurement();

    const chartData = useDeepMemo(
      () => adaptMeasurementsDataToChart(data),
      [data]
    );

    const filteredChartData = useDeepMemo(() => {
      if (!measurementTypesSelection) {
        return chartData;
      }
      return filterChartDataByMeasurementTypeParent(
        chartData,
        measurementTypesSelection
      );
    }, [chartData, measurementTypesSelection]);

    const axisNames = useMemo(
      () => ({
        x: `Pressure (${PRESSURE_UNIT.toLowerCase()})`,
        y: `Depth (${depthUnit})`,
      }),
      [depthUnit]
    );

    const emptySubtitle = useDeepMemo(() => {
      if (measurementTypesSelection && isEmpty(measurementTypesSelection)) {
        return NO_OPTIONS_SELECTED_TEXT;
      }
      if (!isEmpty(chartData) && isEmpty(filteredChartData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return EMPTY_MEASUREMENTS_DATA_TEXT;
    }, [chartData, filteredChartData, measurementTypesSelection]);

    return (
      <NoUnmountShowHide show={isVisible}>
        <PlotlyChartColumn
          data={filteredChartData}
          isLoading={isLoading}
          header={ChartColumn.MEASUREMENTS}
          title={CHART_TITLE}
          axisNames={axisNames}
          scaleBlocks={scaleBlocks}
          emptySubtitle={emptySubtitle}
          {...dragHandleProps}
        />
      </NoUnmountShowHide>
    );
  }
);
