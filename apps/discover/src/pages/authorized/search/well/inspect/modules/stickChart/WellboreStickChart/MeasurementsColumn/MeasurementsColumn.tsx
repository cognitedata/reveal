import { filterChartDataByMeasurementTypeParent } from 'domain/wells/measurements/internal/selectors/filterChartDataByMeasurementTypeParent';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
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
  EXPAND_FIT_LOT_GRAPH_TEXT,
  PRESSURE_UNIT,
  SELECT_TVD_MESSAGE,
} from './constants';

export interface MeasurementsColumnProps extends ColumnVisibilityProps {
  data?: DepthMeasurementWithData;
  isLoading?: boolean;
  scaleBlocks: number[];
  measurementTypesSelection?: BooleanMap;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const MeasurementsColumn: React.FC<
  WithDragHandleProps<MeasurementsColumnProps>
> = React.memo(
  ({
    data,
    isLoading,
    scaleBlocks,
    measurementTypesSelection,
    depthMeasurementType = DepthMeasurementUnit.TVD,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const { data: depthUnit } = useUserPreferencesMeasurement();

    const isTvdScaleSelected =
      depthMeasurementType === DepthMeasurementUnit.TVD;

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
      if (isEmpty(chartData)) {
        return EMPTY_MEASUREMENTS_DATA_TEXT;
      }
      /**
       * If chart data is available, but scale is selected to MD,
       * we show the user a message to select TVD scale to see the graph.
       */
      if (!isTvdScaleSelected) {
        return SELECT_TVD_MESSAGE;
      }
      if (measurementTypesSelection && isEmpty(measurementTypesSelection)) {
        return NO_OPTIONS_SELECTED_TEXT;
      }
      if (isEmpty(filteredChartData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return undefined;
    }, [chartData, filteredChartData, measurementTypesSelection]);

    return (
      <NoUnmountShowHide show={isVisible}>
        <PlotlyChartColumn
          data={isTvdScaleSelected ? filteredChartData : EMPTY_ARRAY}
          isLoading={isLoading}
          header={ChartColumn.MEASUREMENTS}
          title={CHART_TITLE}
          axisNames={axisNames}
          scaleBlocks={scaleBlocks}
          emptySubtitle={emptySubtitle}
          expandSubtitle={EXPAND_FIT_LOT_GRAPH_TEXT}
          {...dragHandleProps}
        />
      </NoUnmountShowHide>
    );
  }
);
