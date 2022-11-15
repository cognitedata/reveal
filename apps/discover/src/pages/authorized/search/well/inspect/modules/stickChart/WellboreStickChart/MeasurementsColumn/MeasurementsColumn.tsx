import { filterChartDataByMeasurementTypeParent } from 'domain/wells/measurements/internal/selectors/filterChartDataByMeasurementTypeParent';
import { filterMdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterMdIndexedDepthMeasurements';
import { filterTvdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterTvdIndexedDepthMeasurements';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import React, { useMemo } from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn, ColumnVisibilityProps } from '../../types';
import { adaptMeasurementsDataToChart } from '../../utils/adaptMeasurementsDataToChart';
import {
  DEFAULT_CHART_WIDTH,
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
} from '../constants';

import { CHART_TITLE, PRESSURE_UNIT } from './constants';

export interface MeasurementsColumnProps extends ColumnVisibilityProps {
  data?: DepthMeasurementWithData[];
  isLoading?: boolean;
  scaleBlocks: number[];
  measurementTypesSelection?: BooleanMap;
  depthMeasurementType?: DepthMeasurementUnit;
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
    isVisible = true,
    ...dragHandleProps
  }) => {
    const { data: depthUnit } = useUserPreferencesMeasurement();

    const chartDataMD = useDeepMemo(() => {
      const data = filterMdIndexedDepthMeasurements(allData);
      return adaptMeasurementsDataToChart(head(data));
    }, [allData]);

    const chartDataTVD = useDeepMemo(() => {
      const data = filterTvdIndexedDepthMeasurements(allData);
      return adaptMeasurementsDataToChart(head(data));
    }, [allData]);

    const chartData = useDeepMemo(() => {
      if (depthMeasurementType === DepthMeasurementUnit.MD) {
        return chartDataMD;
      }
      return chartDataTVD;
    }, [chartDataMD, chartDataTVD, depthMeasurementType]);

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
      if (!isEmpty(allData) && isEmpty(filteredChartData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return undefined;
    }, [chartData, filteredChartData, measurementTypesSelection]);

    return (
      <PlotlyChartColumn
        id="measurements-column"
        isVisible={isVisible}
        data={filteredChartData}
        isLoading={isLoading}
        header={ChartColumn.MEASUREMENTS}
        chartHeader={CHART_TITLE}
        axisNames={axisNames}
        scaleBlocks={scaleBlocks}
        emptySubtitle={emptySubtitle}
        chartWidth={DEFAULT_CHART_WIDTH / 2}
        {...dragHandleProps}
      />
    );
  }
);
