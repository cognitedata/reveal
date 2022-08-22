import { useTrajectoryChartConfigByAccessors } from 'domain/wells/trajectory/internal/hooks/useTrajectoryChartConfigByAccessors';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn } from '../../types';
import { adapTrajectoryDataToChart } from '../../utils/adapTrajectoryDataToChart';

import { CHART_TITLE, SELECT_TVD_MESSAGE } from './constants';
import { TrajectoryChartWrapper } from './elements';

export interface TrajectoryColumnProps {
  data: TrajectoryWithData;
  scaleBlocks: number[];
  curveColor: string;
  isTvdScaleSelected?: boolean;
}

export const TrajectoryColumn: React.FC<
  WithDragHandleProps<TrajectoryColumnProps>
> = ({
  data,
  scaleBlocks,
  curveColor,
  isTvdScaleSelected = true,
  ...dragHandleProps
}) => {
  const { data: depthUnit } = useUserPreferencesMeasurement();

  const chartConfig = useTrajectoryChartConfigByAccessors({
    x: 'ed',
    y: 'tvd',
  });

  const chartData = useDeepMemo(
    () => adapTrajectoryDataToChart(data, curveColor, chartConfig),
    [data]
  );

  const axisNames = {
    x: `Equivalent Departure (${depthUnit})`,
    y: `Depth (${depthUnit})`,
  };

  return (
    <TrajectoryChartWrapper>
      <PlotlyChartColumn
        data={isTvdScaleSelected ? chartData : []}
        header={ChartColumn.TRAJECTORY}
        title={CHART_TITLE}
        axisNames={axisNames}
        scaleBlocks={scaleBlocks}
        emptySubtitle={
          /**
           * If chart data is available, but scale is selected to MD,
           * we show the user a message to select TVD scale to see the graph.
           */
          !isEmpty(chartData) && !isTvdScaleSelected
            ? SELECT_TVD_MESSAGE
            : undefined
        }
        {...dragHandleProps}
      />
    </TrajectoryChartWrapper>
  );
};
