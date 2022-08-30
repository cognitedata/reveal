import { useTrajectoryChartConfigByAccessors } from 'domain/wells/trajectory/internal/hooks/useTrajectoryChartConfigByAccessors';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { PlotData } from 'plotly.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn, ColumnVisibilityProps } from '../../types';
import { adapTrajectoryDataToChart } from '../../utils/adapTrajectoryDataToChart';

import {
  CHART_TITLE,
  EMPTY_TRAJECTORY_DATA_TEXT,
  SELECT_TVD_MESSAGE,
} from './constants';
import { TrajectoryChartWrapper } from './elements';

export interface TrajectoryColumnProps extends ColumnVisibilityProps {
  data?: TrajectoryWithData;
  isLoading?: boolean;
  scaleBlocksTVD: number[];
  curveColor: string;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const TrajectoryColumn: React.FC<
  WithDragHandleProps<TrajectoryColumnProps>
> = React.memo(
  ({
    data,
    isLoading,
    scaleBlocksTVD,
    curveColor,
    depthMeasurementType = DepthMeasurementUnit.TVD,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const { data: depthUnit } = useUserPreferencesMeasurement();

    const isTvdScaleSelected =
      depthMeasurementType === DepthMeasurementUnit.TVD;

    const chartConfig = useTrajectoryChartConfigByAccessors({
      x: 'ed',
      y: 'tvd',
    });

    const chartData = useDeepMemo(() => {
      if (!data) {
        return EMPTY_ARRAY as Partial<PlotData>[];
      }
      return adapTrajectoryDataToChart(data, curveColor, chartConfig);
    }, [data]);

    const axisNames = useMemo(
      () => ({
        x: `Equivalent Departure (${depthUnit})`,
        y: `Depth (${depthUnit})`,
      }),
      [depthUnit]
    );

    const emptySubtitle = useDeepMemo(() => {
      if (isEmpty(chartData)) {
        return EMPTY_TRAJECTORY_DATA_TEXT;
      }
      /**
       * If chart data is available, but scale is selected to MD,
       * we show the user a message to select TVD scale to see the graph.
       */
      if (!isTvdScaleSelected) {
        return SELECT_TVD_MESSAGE;
      }
      return undefined;
    }, [chartData, depthMeasurementType]);

    return (
      <NoUnmountShowHide show={isVisible}>
        <TrajectoryChartWrapper>
          <PlotlyChartColumn
            data={isTvdScaleSelected ? chartData : EMPTY_ARRAY}
            isLoading={isLoading}
            header={ChartColumn.TRAJECTORY}
            title={CHART_TITLE}
            axisNames={axisNames}
            scaleBlocks={scaleBlocksTVD}
            emptySubtitle={emptySubtitle}
            {...dragHandleProps}
          />
        </TrajectoryChartWrapper>
      </NoUnmountShowHide>
    );
  }
);
