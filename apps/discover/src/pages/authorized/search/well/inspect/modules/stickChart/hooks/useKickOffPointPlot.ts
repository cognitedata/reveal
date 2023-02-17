import { getKickoffPoint } from 'domain/wells/wellbore/internal/selectors/getKickoffPoint';
import { KickoffDepth } from 'domain/wells/wellbore/internal/types';

import { useMemo } from 'react';

import { PlotData } from 'plotly.js';
import { shadeColor } from 'utils/shadeColor';

import { EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import {
  KICK_OFF_POINT_MARKER_SIZE,
  TRAJECTORY_SECONDARY_DATA_COMMON_PROPS,
} from '../WellboreStickChart/TrajectoryColumn/constants';

interface Props {
  kickoffDepth?: KickoffDepth;
  depthMeasurementType: DepthMeasurementUnit;
  curveColor: string;
  showKickoffPoint: boolean;
  scaleMDtoED: (value: number) => number;
  scaleTVDtoED: (value: number) => number;
  getTextPosition: (x: number) => PlotData['textposition'];
}

export const useKickOffPointPlot = ({
  kickoffDepth,
  depthMeasurementType,
  curveColor,
  showKickoffPoint,
  scaleMDtoED,
  scaleTVDtoED,
  getTextPosition,
}: Props): Partial<PlotData> => {
  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  const kickoffPoint = useDeepMemo(() => {
    if (!showKickoffPoint || !kickoffDepth) {
      return undefined;
    }
    return getKickoffPoint({
      kickoffDepth,
      scaleMDtoED,
      scaleTVDtoED,
    });
  }, [showKickoffPoint, kickoffDepth, scaleMDtoED, scaleTVDtoED]);

  return useMemo(() => {
    if (!kickoffPoint) {
      return EMPTY_OBJECT;
    }

    const {
      equivalentDepartureMD,
      equivalentDepartureTVD,
      measuredDepth,
      trueVerticalDepth,
    } = kickoffPoint;

    const equivalentDeparture = isMdScale
      ? equivalentDepartureMD
      : equivalentDepartureTVD;

    const depth = isMdScale ? measuredDepth : trueVerticalDepth;

    return {
      ...TRAJECTORY_SECONDARY_DATA_COMMON_PROPS,
      x: [equivalentDeparture],
      y: [depth],
      marker: {
        color: shadeColor(curveColor, -25),
        size: KICK_OFF_POINT_MARKER_SIZE,
        line: {
          color: '#FFFFFF',
          width: 2,
        },
      },
      text: ['Kick off point'],
      textposition: getTextPosition(equivalentDeparture),
    };
  }, [kickoffPoint, depthMeasurementType]);
};
