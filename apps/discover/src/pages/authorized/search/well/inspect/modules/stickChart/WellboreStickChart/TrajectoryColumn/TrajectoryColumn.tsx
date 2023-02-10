import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import { KickoffDepth } from 'domain/wells/wellbore/internal/types';

import React, { useState } from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { PlotlyChartColumn } from '../../components/PlotlyChartColumn';
import { useTrajectoryColumnSecondaryData } from '../../hooks/useTrajectoryColumnSecondaryData';
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
  kickoffDepth?: KickoffDepth;
  isLoading?: boolean;
  scaleBlocks: number[];
  curveColor: string;
  depthMeasurementType?: DepthMeasurementUnit;
  trajectoryCurveConfigs: TrajectoryCurveConfig[];
  showKickoffPoint?: boolean;
}

export const TrajectoryColumn: React.FC<
  WithDragHandleProps<TrajectoryColumnProps>
> = React.memo(
  ({
    data,
    kickoffDepth,
    isLoading,
    scaleBlocks,
    curveColor,
    depthMeasurementType = DepthMeasurementUnit.TVD,
    trajectoryCurveConfigs,
    showKickoffPoint = true,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const [selectedCurve, setSelectedCurve] = useState<TrajectoryCurve>();

    const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

    const secondaryData = useTrajectoryColumnSecondaryData({
      trajectoryDataRows: data?.rows,
      kickoffDepth,
      selectedCurve,
      depthMeasurementType,
      curveColor,
      showKickoffPoint,
    });

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

    const trajectoryCurves = isMdScale
      ? TRAJECTORY_CURVES_MD
      : TRAJECTORY_CURVES_TVD;

    useDeepEffect(() => {
      setSelectedCurve(head(trajectoryCurves));
    }, [trajectoryCurves]);

    if (!selectedCurve) {
      return <div {...dragHandleProps} />;
    }

    return (
      <TrajectoryChartWrapper data-testid="trajectory-column">
        <PlotlyChartColumn
          id="trajectory-column"
          isVisible={isVisible}
          isLoading={isLoading || (!isEmpty(data) && !selectedCurve)}
          columnHeader={ChartColumn.TRAJECTORY}
          scaleBlocks={scaleBlocks}
          chartHeader={
            <TrajectoryCurveSelector
              curves={trajectoryCurves}
              selectedCurve={selectedCurve}
              onChangeCurve={setSelectedCurve}
            />
          }
          nativeScale={NATIVE_SCALE_CURVES.includes(selectedCurve)}
          secondaryData={secondaryData}
          {...trajectoryCurveDataProps[selectedCurve]}
          {...dragHandleProps}
        />
      </TrajectoryChartWrapper>
    );
  }
);
