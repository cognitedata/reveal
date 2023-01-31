import { scaleLinear } from 'd3-scale';
import { toFixedNumberFromNumber } from 'utils/number';

import { TrajectoryDataRow } from '@cognite/sdk-wells';

import { KickoffDepth, KickoffPoint } from '../types';

export const getKickoffPoint = (
  trajectoryRows: TrajectoryDataRow[],
  kickoffDepth: KickoffDepth
): KickoffPoint | undefined => {
  const rowData = trajectoryRows.reduce(
    (data, { measuredDepth, trueVerticalDepth, equivalentDeparture }) => {
      return {
        measuredDepths: [...data.measuredDepths, measuredDepth],
        trueVerticalDepths: [...data.trueVerticalDepths, trueVerticalDepth],
        equivalentDepartures: [
          ...data.equivalentDepartures,
          equivalentDeparture,
        ],
      };
    },
    {
      measuredDepths: [] as number[],
      trueVerticalDepths: [] as number[],
      equivalentDepartures: [] as number[],
    }
  );

  const scaleMD = scaleLinear()
    .domain(rowData.measuredDepths)
    .range(rowData.equivalentDepartures);

  const scaleTVD = scaleLinear()
    .domain(rowData.trueVerticalDepths)
    .range(rowData.equivalentDepartures);

  return {
    ...kickoffDepth,
    equivalentDepartureMD: toFixedNumberFromNumber(
      scaleMD(kickoffDepth.measuredDepth)
    ),
    equivalentDepartureTVD: toFixedNumberFromNumber(
      scaleTVD(kickoffDepth.trueVerticalDepth)
    ),
  };
};
