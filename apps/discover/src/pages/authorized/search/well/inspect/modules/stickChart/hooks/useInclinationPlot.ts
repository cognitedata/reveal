import { useMemo } from 'react';

import { PlotData } from 'plotly.js';

import { EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { AnnotationDepths } from '../types';
import { getInclinationDisplay } from '../utils/getInclinationDisplay';
import {
  INCLINATION_MARKER_SIZE,
  TRAJECTORY_SECONDARY_DATA_COMMON_PROPS,
} from '../WellboreStickChart/TrajectoryColumn/constants';

const INCLINATION_PLOT_INITIAL_VALUE = {
  x: [] as number[],
  y: [] as number[],
  text: [] as string[],
  textposition: [] as string[],
};

interface Props {
  inclinationAnnotationDepths?: AnnotationDepths;
  depthMeasurementType: DepthMeasurementUnit;
  scaleMDtoED: (value: number) => number;
  scaleTVDtoED: (value: number) => number;
  scaleMDtoInclination: (value: number) => number;
  scaleTVDtoInclination: (value: number) => number;
  getTextPosition: (x: number) => PlotData['textposition'];
}

export const useInclinationPlot = ({
  inclinationAnnotationDepths,
  depthMeasurementType,
  scaleMDtoED,
  scaleTVDtoED,
  scaleMDtoInclination,
  scaleTVDtoInclination,
  getTextPosition,
}: Props): Partial<PlotData> => {
  const inclinationPlotMD: Partial<PlotData> = useDeepMemo(() => {
    if (!inclinationAnnotationDepths) {
      return EMPTY_OBJECT;
    }

    return inclinationAnnotationDepths.measuredDepths.reduce(
      (result, depth) => {
        const equivalentDeparture = scaleMDtoED(depth);
        const inclination = scaleMDtoInclination(depth);

        return {
          x: [...result.x, equivalentDeparture],
          y: [...result.y, depth],
          text: [...result.text, getInclinationDisplay(inclination)],
          textposition: [
            ...result.textposition,
            getTextPosition(equivalentDeparture),
          ],
        };
      },
      INCLINATION_PLOT_INITIAL_VALUE
    );
  }, [inclinationAnnotationDepths?.measuredDepths]);

  const inclinationPlotTVD: Partial<PlotData> = useDeepMemo(() => {
    if (!inclinationAnnotationDepths) {
      return EMPTY_OBJECT;
    }

    return inclinationAnnotationDepths.trueVerticalDepths.reduce(
      (result, depth) => {
        const equivalentDeparture = scaleTVDtoED(depth);
        const inclination = scaleTVDtoInclination(depth);

        return {
          x: [...result.x, equivalentDeparture],
          y: [...result.y, depth],
          text: [...result.text, getInclinationDisplay(inclination)],
          textposition: [
            ...result.textposition,
            getTextPosition(equivalentDeparture),
          ],
        };
      },
      INCLINATION_PLOT_INITIAL_VALUE
    );
  }, [inclinationAnnotationDepths?.trueVerticalDepths]);

  return useMemo(() => {
    const inclinationPlot =
      depthMeasurementType === DepthMeasurementUnit.MD
        ? inclinationPlotMD
        : inclinationPlotTVD;

    return {
      ...TRAJECTORY_SECONDARY_DATA_COMMON_PROPS,
      ...inclinationPlot,
      marker: {
        symbol: 'square',
        color: '#FFFFFF',
        size: INCLINATION_MARKER_SIZE,
        line: {
          color: '#000000',
          width: 1,
        },
      },
    };
  }, [inclinationPlotMD, inclinationPlotTVD, depthMeasurementType]);
};
