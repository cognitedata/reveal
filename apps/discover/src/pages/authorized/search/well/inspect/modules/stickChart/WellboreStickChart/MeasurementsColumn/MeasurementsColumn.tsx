import { filterChartDataByMeasurementTypeParent } from 'domain/wells/measurements/internal/selectors/filterChartDataByMeasurementTypeParent';
import { filterMdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterMdIndexedDepthMeasurements';
import { filterTvdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterTvdIndexedDepthMeasurements';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import React from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn, ColumnVisibilityProps } from '../../types';
import { adaptMeasurementsDataToChart } from '../../utils/adaptMeasurementsDataToChart';
import {
  DEFAULT_CHART_WIDTH,
  DEFAULT_PRESSURE_UNIT,
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
} from '../constants';

export interface MeasurementsColumnProps extends ColumnVisibilityProps {
  data?: DepthMeasurementWithData[];
  isLoading?: boolean;
  scaleBlocks: number[];
  measurementTypesSelection?: BooleanMap;
  depthMeasurementType?: DepthMeasurementUnit;
  pressureUnit?: PressureUnit;
}

export const MeasurementsColumn: React.FC<
  WithDragHandleProps<MeasurementsColumnProps>
> = React.memo(
  ({
    data: allData = EMPTY_ARRAY,
    isLoading,
    scaleBlocks,
    measurementTypesSelection,
    depthMeasurementType = DepthMeasurementUnit.TVD,
    pressureUnit = DEFAULT_PRESSURE_UNIT,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const { data: depthUnit } = useUserPreferencesMeasurement();

    const chartDataMD = useDeepMemo(() => {
      const data = head(filterMdIndexedDepthMeasurements(allData));

      if (!data) {
        return EMPTY_ARRAY;
      }

      return adaptMeasurementsDataToChart(data, pressureUnit);
    }, [allData, pressureUnit]);

    const chartDataTVD = useDeepMemo(() => {
      const data = head(filterTvdIndexedDepthMeasurements(allData));

      if (!data) {
        return EMPTY_ARRAY;
      }

      return adaptMeasurementsDataToChart(data, pressureUnit);
    }, [allData, pressureUnit]);

    const chartData =
      depthMeasurementType === DepthMeasurementUnit.MD
        ? chartDataMD
        : chartDataTVD;

    const filteredChartData = useDeepMemo(() => {
      if (!measurementTypesSelection) {
        return chartData;
      }
      return filterChartDataByMeasurementTypeParent(
        chartData,
        measurementTypesSelection
      );
    }, [chartData, measurementTypesSelection]);

    const axisNames = {
      x: `Pressure (${pressureUnit})`,
      y: `Depth (${depthUnit})`,
    };

    const getEmptySubtitle = () => {
      if (measurementTypesSelection && isEmpty(measurementTypesSelection)) {
        return NO_OPTIONS_SELECTED_TEXT;
      }
      if (!isEmpty(allData) && isEmpty(filteredChartData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return undefined;
    };

    return (
      <PlotlyChartColumn
        id="measurements-column"
        isVisible={isVisible}
        data={filteredChartData}
        isLoading={isLoading}
        header={ChartColumn.MEASUREMENTS}
        chartHeader="Depth vs Pressure"
        axisNames={axisNames}
        scaleBlocks={scaleBlocks}
        emptySubtitle={getEmptySubtitle()}
        chartWidth={DEFAULT_CHART_WIDTH / 2}
        {...dragHandleProps}
      />
    );
  }
);
