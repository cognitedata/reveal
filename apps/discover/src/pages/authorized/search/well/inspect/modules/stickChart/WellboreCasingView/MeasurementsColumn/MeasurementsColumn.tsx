import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import React from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn } from '../../types';
import { adaptMeasurementsDataToChart } from '../../utils/adaptMeasurementsDataToChart';

import { CHART_TITLE, PRESSURE_UNIT } from './constants';

export interface MeasurementsColumnProps {
  data?: DepthMeasurementWithData;
  scaleBlocks: number[];
}

export const MeasurementsColumn: React.FC<
  WithDragHandleProps<MeasurementsColumnProps>
> = ({ data, scaleBlocks, ...dragHandleProps }) => {
  const { data: depthUnit } = useUserPreferencesMeasurement();

  const chartData = useDeepMemo(
    () => adaptMeasurementsDataToChart(data),
    [data]
  );

  const axisNames = {
    x: `Pressure (${PRESSURE_UNIT.toLowerCase()})`,
    y: `Depth (${depthUnit})`,
  };

  return (
    <PlotlyChartColumn
      data={chartData}
      header={ChartColumn.MEASUREMENTS}
      title={CHART_TITLE}
      axisNames={axisNames}
      scaleBlocks={scaleBlocks}
      {...dragHandleProps}
    />
  );
};
