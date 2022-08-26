import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import React, { useMemo } from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn, ColumnVisibilityProps } from '../../types';
import { adaptMeasurementsDataToChart } from '../../utils/adaptMeasurementsDataToChart';

import {
  CHART_TITLE,
  EMPTY_MEASUREMENTS_DATA_TEXT,
  PRESSURE_UNIT,
} from './constants';

export interface MeasurementsColumnProps extends ColumnVisibilityProps {
  data?: DepthMeasurementWithData;
  isLoading?: boolean;
  scaleBlocks: number[];
}

export const MeasurementsColumn: React.FC<
  WithDragHandleProps<MeasurementsColumnProps>
> = React.memo(
  ({ data, isLoading, scaleBlocks, isVisible = true, ...dragHandleProps }) => {
    const { data: depthUnit } = useUserPreferencesMeasurement();

    const chartData = useDeepMemo(
      () => adaptMeasurementsDataToChart(data),
      [data]
    );

    const axisNames = useMemo(
      () => ({
        x: `Pressure (${PRESSURE_UNIT.toLowerCase()})`,
        y: `Depth (${depthUnit})`,
      }),
      [depthUnit]
    );

    return (
      <NoUnmountShowHide show={isVisible}>
        <PlotlyChartColumn
          data={chartData}
          isLoading={isLoading}
          header={ChartColumn.MEASUREMENTS}
          title={CHART_TITLE}
          axisNames={axisNames}
          scaleBlocks={scaleBlocks}
          emptySubtitle={EMPTY_MEASUREMENTS_DATA_TEXT}
          {...dragHandleProps}
        />
      </NoUnmountShowHide>
    );
  }
);
