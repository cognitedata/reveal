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
  NATIVE_SCALE_CURVES,
  TRAJECTORY_CURVES_MD,
  TRAJECTORY_CURVES_TVD,
} from './constants';
import { TrajectoryChartWrapper } from './elements';
import { TrajectoryCurveSelector } from './TrajectoryCurveSelector';
import { TrajectoryCurve } from './types';

export interface TrajectoryColumnProps extends ColumnVisibilityProps {
  data?: TrajectoryWithData;
  isLoading?: boolean;
  scaleBlocks: number[];
  curveColor: string;
  depthMeasurementType?: DepthMeasurementUnit;
  trajectoryCurveConfigs: TrajectoryCurveConfig[];
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
    isVisible = true,
    ...dragHandleProps
  }) => {
    const [selectedCurve, setSelectedCurve] = useState<TrajectoryCurve>();

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

    const trajectoryCurves = useMemo(() => {
      if (depthMeasurementType === DepthMeasurementUnit.MD) {
        return TRAJECTORY_CURVES_MD;
      }
      return TRAJECTORY_CURVES_TVD;
    }, [depthMeasurementType]);

    useDeepEffect(() => {
      setSelectedCurve(head(trajectoryCurves));
    }, [trajectoryCurves]);

    if (!selectedCurve) {
      return null;
    }

    return (
      <NoUnmountShowHide show={isVisible}>
        <TrajectoryChartWrapper data-testid="trajectory-column">
          <PlotlyChartColumn
            isLoading={isLoading || (!isEmpty(data) && !selectedCurve)}
            header={ChartColumn.TRAJECTORY}
            scaleBlocks={scaleBlocks}
            chartHeader={
              <TrajectoryCurveSelector
                curves={trajectoryCurves}
                selectedCurve={selectedCurve}
                onChangeCurve={setSelectedCurve}
              />
            }
            nativeScale={NATIVE_SCALE_CURVES.includes(selectedCurve)}
            {...trajectoryCurveDataProps[selectedCurve]}
            {...dragHandleProps}
          />
        </TrajectoryChartWrapper>
      </NoUnmountShowHide>
    );
  }
);
