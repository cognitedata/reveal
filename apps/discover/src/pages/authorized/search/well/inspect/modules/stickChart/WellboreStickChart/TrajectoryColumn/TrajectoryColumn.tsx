import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

import React, { useMemo, useState } from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import {
  ChartColumn,
  ColumnVisibilityProps,
  TrajectoryCurveConfig,
} from '../../types';
import { adaptToTrajectoryCurveDataProps } from '../../utils/adaptToTrajectoryCurveDataProps';
import {
  DATA_NOT_AVAILABLE_IN_TVD_MODE_TEXT,
  SWITCH_BUTTON_TEXT,
} from '../constants';

import { TrajectoryChartWrapper } from './elements';
import { TrajectoryCurveSelector } from './TrajectoryCurveSelector';

export interface TrajectoryColumnProps extends ColumnVisibilityProps {
  data?: TrajectoryWithData;
  isLoading?: boolean;
  scaleBlocks: number[];
  curveColor: string;
  depthMeasurementType?: DepthMeasurementUnit;
  trajectoryCurveConfigs: TrajectoryCurveConfig[];
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
    trajectoryCurveConfigs,
    onChangeDepthMeasurementType,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const [selectedCurve, setSelectedCurve] = useState<string>('');

    const trajectoryCurveDataProps = useDeepMemo(() => {
      if (!data) {
        return EMPTY_OBJECT as Record<string, unknown>;
      }
      return adaptToTrajectoryCurveDataProps(
        trajectoryCurveConfigs,
        data,
        curveColor
      );
    }, [data, trajectoryCurveConfigs]);

    const swichToTvdActionProps = useMemo(() => {
      if (depthMeasurementType === DepthMeasurementUnit.TVD) {
        return EMPTY_OBJECT;
      }
      return {
        actionMessage: DATA_NOT_AVAILABLE_IN_TVD_MODE_TEXT,
        actionButtonText: SWITCH_BUTTON_TEXT,
        onClickActionButton: () =>
          onChangeDepthMeasurementType?.(DepthMeasurementUnit.TVD),
      };
    }, [depthMeasurementType, onChangeDepthMeasurementType]);

    useDeepEffect(() => {
      setSelectedCurve(head(Object.keys(trajectoryCurveDataProps)) || '');
    }, [trajectoryCurveDataProps]);

    return (
      <NoUnmountShowHide show={isVisible}>
        <TrajectoryChartWrapper data-testid="trajectory-column">
          <PlotlyChartColumn
            isLoading={isLoading || (!isEmpty(data) && !selectedCurve)}
            header={ChartColumn.TRAJECTORY}
            scaleBlocks={scaleBlocks}
            chartHeader={
              <TrajectoryCurveSelector
                curves={Object.keys(trajectoryCurveDataProps)}
                selectedCurve={selectedCurve}
                onChangeCurve={setSelectedCurve}
              />
            }
            {...trajectoryCurveDataProps[selectedCurve]}
            {...swichToTvdActionProps}
            {...dragHandleProps}
          />
        </TrajectoryChartWrapper>
      </NoUnmountShowHide>
    );
  }
);
