import { useTrajectoryChartConfigByAccessors } from 'domain/wells/trajectory/internal/hooks/useTrajectoryChartConfigByAccessors';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

import React, { useMemo } from 'react';

import { PlotData } from 'plotly.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY, EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { ChartColumn, ColumnVisibilityProps } from '../../types';
import { adapTrajectoryDataToChart } from '../../utils/adapTrajectoryDataToChart';
import {
  DATA_NOT_AVAILABLE_IN_TVD_MODE_TEXT,
  SWITCH_BUTTON_TEXT,
} from '../constants';

import { CHART_TITLE } from './constants';
import { TrajectoryChartWrapper } from './elements';

export interface TrajectoryColumnProps extends ColumnVisibilityProps {
  data?: TrajectoryWithData;
  isLoading?: boolean;
  scaleBlocks: number[];
  curveColor: string;
  depthMeasurementType?: DepthMeasurementUnit;
  onChangeDepthMeasurementType?: (
    depthMeasurementType: DepthMeasurementUnit
  ) => void;
}

export const TrajectoryColumn: React.FC<
  WithDragHandleProps<TrajectoryColumnProps>
> = React.memo(
  ({
    data,
    isLoading,
    scaleBlocks,
    curveColor,
    depthMeasurementType = DepthMeasurementUnit.TVD,
    onChangeDepthMeasurementType,
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

    const swichToTvdActionProps = useMemo(() => {
      if (isTvdScaleSelected) {
        return EMPTY_OBJECT;
      }
      return {
        actionMessage: DATA_NOT_AVAILABLE_IN_TVD_MODE_TEXT,
        actionButtonText: SWITCH_BUTTON_TEXT,
        onClickActionButton: () =>
          onChangeDepthMeasurementType?.(DepthMeasurementUnit.TVD),
      };
    }, [depthMeasurementType, onChangeDepthMeasurementType]);

    return (
      <NoUnmountShowHide show={isVisible}>
        <TrajectoryChartWrapper data-testid="trajectory-column">
          <PlotlyChartColumn
            data={chartData}
            isLoading={isLoading}
            header={ChartColumn.TRAJECTORY}
            chartHeader={CHART_TITLE}
            axisNames={axisNames}
            scaleBlocks={scaleBlocks}
            {...swichToTvdActionProps}
            {...dragHandleProps}
          />
        </TrajectoryChartWrapper>
      </NoUnmountShowHide>
    );
  }
);
