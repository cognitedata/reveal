import { getKickoffPoint } from 'domain/wells/wellbore/internal/selectors/getKickoffPoint';
import { KickoffDepth } from 'domain/wells/wellbore/internal/types';

import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { PlotData } from 'plotly.js';
import { shadeColor } from 'utils/shadeColor';

import { TrajectoryDataRow } from '@cognite/sdk-wells';

import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import {
  CURVES_TO_SHOW_KICKOFF_POINT,
  KICK_OFF_POINT_MARKER_SIZE,
} from '../WellboreStickChart/TrajectoryColumn/constants';
import { TrajectoryCurve } from '../WellboreStickChart/TrajectoryColumn/types';

interface Props {
  trajectoryDataRows?: TrajectoryDataRow[];
  kickoffDepth?: KickoffDepth;
  selectedCurve?: TrajectoryCurve;
  depthMeasurementType: DepthMeasurementUnit;
  curveColor: string;
  showKickoffPoint: boolean;
}

export const useTrajectoryColumnSecondaryData = ({
  trajectoryDataRows,
  kickoffDepth,
  selectedCurve,
  depthMeasurementType,
  curveColor,
  showKickoffPoint,
}: Props): Partial<PlotData>[] => {
  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  const kickoffPoint = useDeepMemo(() => {
    if (
      !showKickoffPoint ||
      !kickoffDepth ||
      !trajectoryDataRows ||
      isEmpty(trajectoryDataRows)
    ) {
      return undefined;
    }
    return getKickoffPoint(trajectoryDataRows, kickoffDepth);
  }, [showKickoffPoint, trajectoryDataRows, kickoffDepth]);

  const kickOffPointPlot: Partial<PlotData>[] = useMemo(() => {
    if (!kickoffPoint) {
      return EMPTY_ARRAY;
    }

    const {
      equivalentDepartureMD,
      equivalentDepartureTVD,
      measuredDepth,
      trueVerticalDepth,
    } = kickoffPoint;

    return [
      {
        name: '',
        x: [isMdScale ? equivalentDepartureMD : equivalentDepartureTVD],
        y: [isMdScale ? measuredDepth : trueVerticalDepth],
        marker: {
          color: shadeColor(curveColor, -25),
          size: KICK_OFF_POINT_MARKER_SIZE,
        },
        hoverinfo: 'y',
      },
    ];
  }, [kickoffPoint, depthMeasurementType]);

  return useMemo(() => {
    if (
      !selectedCurve ||
      !CURVES_TO_SHOW_KICKOFF_POINT.includes(selectedCurve)
    ) {
      return EMPTY_ARRAY;
    }

    return kickOffPointPlot;
  }, [kickOffPointPlot, selectedCurve]);
};
