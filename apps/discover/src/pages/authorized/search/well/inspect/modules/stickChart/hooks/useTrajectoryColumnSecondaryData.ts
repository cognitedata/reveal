import { KickoffDepth } from 'domain/wells/wellbore/internal/types';
import { getTrajectoryScalers } from 'domain/wells/wellbore/internal/utils/getTrajectoryScalers';

import { useCallback } from 'react';

import { PlotData } from 'plotly.js';

import { TrajectoryDataRow } from '@cognite/sdk-wells';

import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { AnnotationDepths } from '../types';
import { CURVES_TO_SHOW_KICKOFF_POINT } from '../WellboreStickChart/TrajectoryColumn/constants';
import { TrajectoryCurve } from '../WellboreStickChart/TrajectoryColumn/types';

import { useInclinationPlot } from './useInclinationPlot';
import { useKickOffPointPlot } from './useKickOffPointPlot';

interface Props {
  trajectoryDataRows?: TrajectoryDataRow[];
  kickoffDepth?: KickoffDepth;
  selectedCurve?: TrajectoryCurve;
  depthMeasurementType: DepthMeasurementUnit;
  curveColor: string;
  showKickoffPoint: boolean;
  inclinationAnnotationDepths?: AnnotationDepths;
}

export const useTrajectoryColumnSecondaryData = ({
  trajectoryDataRows = EMPTY_ARRAY,
  kickoffDepth,
  selectedCurve,
  depthMeasurementType,
  curveColor,
  showKickoffPoint,
  inclinationAnnotationDepths,
}: Props): Partial<PlotData>[] => {
  const {
    scaleMDtoED,
    scaleTVDtoED,
    scaleMDtoInclination,
    scaleTVDtoInclination,
  } = useDeepMemo(() => {
    return getTrajectoryScalers(trajectoryDataRows);
  }, [trajectoryDataRows]);

  const maxEquivalentDeparture = useDeepMemo(() => {
    return Math.max(
      ...trajectoryDataRows.map(
        ({ equivalentDeparture }) => equivalentDeparture
      )
    );
  }, [trajectoryDataRows]);

  const getTextPosition = useCallback(
    (x: number): PlotData['textposition'] => {
      if (x > maxEquivalentDeparture / 2) {
        return 'middle left';
      }
      return 'middle right';
    },
    [maxEquivalentDeparture]
  );

  const kickOffPointPlot = useKickOffPointPlot({
    kickoffDepth,
    depthMeasurementType,
    curveColor,
    showKickoffPoint:
      showKickoffPoint &&
      !!selectedCurve &&
      CURVES_TO_SHOW_KICKOFF_POINT.includes(selectedCurve),
    scaleMDtoED,
    scaleTVDtoED,
    getTextPosition,
  });

  const inclinationPlot = useInclinationPlot({
    inclinationAnnotationDepths,
    depthMeasurementType,
    scaleMDtoED,
    scaleTVDtoED,
    scaleMDtoInclination,
    scaleTVDtoInclination,
    getTextPosition,
  });

  return [kickOffPointPlot, inclinationPlot];
};
