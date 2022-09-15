import { filterChartDataByMeasurementTypeParent } from 'domain/wells/measurements/internal/selectors/filterChartDataByMeasurementTypeParent';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn, ColumnVisibilityProps } from '../../types';
import { adaptMeasurementsDataToChart } from '../../utils/adaptMeasurementsDataToChart';
import {
  DATA_NOT_AVAILABLE_IN_MD_MODE_TEXT,
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
  SWITCH_BUTTON_TEXT,
} from '../constants';

import { CHART_TITLE, PRESSURE_UNIT } from './constants';

export interface MeasurementsColumnProps extends ColumnVisibilityProps {
  data?: DepthMeasurementWithData;
  isLoading?: boolean;
  scaleBlocks: number[];
  measurementTypesSelection?: BooleanMap;
  depthMeasurementType?: DepthMeasurementUnit;
  onChangeDepthMeasurementType?: (
    depthMeasurementType: DepthMeasurementUnit
  ) => void;
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
    onChangeDepthMeasurementType,
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
      if (measurementTypesSelection && isEmpty(measurementTypesSelection)) {
        return NO_OPTIONS_SELECTED_TEXT;
      }
      if (!isEmpty(data) && isEmpty(filteredChartData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return undefined;
    }, [chartData, filteredChartData, measurementTypesSelection]);

    const swichToTvdActionProps = useMemo(() => {
      if (isTvdScaleSelected) {
        return EMPTY_OBJECT;
      }
      return {
        actionMessage: DATA_NOT_AVAILABLE_IN_MD_MODE_TEXT,
        actionButtonText: SWITCH_BUTTON_TEXT,
        onClickActionButton: () =>
          onChangeDepthMeasurementType?.(DepthMeasurementUnit.TVD),
      };
    }, [depthMeasurementType, onChangeDepthMeasurementType]);

    return (
      <NoUnmountShowHide show={isVisible}>
        <PlotlyChartColumn
          data={filteredChartData}
          isLoading={isLoading}
          header={ChartColumn.MEASUREMENTS}
          chartHeader={CHART_TITLE}
          axisNames={axisNames}
          scaleBlocks={scaleBlocks}
          emptySubtitle={emptySubtitle}
          {...swichToTvdActionProps}
          {...dragHandleProps}
        />
      </NoUnmountShowHide>
    );
  }
);
