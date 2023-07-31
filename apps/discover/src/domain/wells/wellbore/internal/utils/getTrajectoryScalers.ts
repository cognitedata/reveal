import { scaleLinear } from 'd3-scale';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import { TrajectoryDataRow } from '@cognite/sdk-wells';

export const getTrajectoryScalers = (
  trajectoryDataRows: TrajectoryDataRow[]
) => {
  const rowData = trajectoryDataRows.reduce(
    (
      data,
      { measuredDepth, trueVerticalDepth, equivalentDeparture, inclination }
    ) => {
      return {
        measuredDepths: [...data.measuredDepths, measuredDepth],
        trueVerticalDepths: [...data.trueVerticalDepths, trueVerticalDepth],
        equivalentDepartures: [
          ...data.equivalentDepartures,
          equivalentDeparture,
        ],
        inclinations: [...data.inclinations, inclination],
      };
    },
    {
      measuredDepths: [] as number[],
      trueVerticalDepths: [] as number[],
      equivalentDepartures: [] as number[],
      inclinations: [] as number[],
    }
  );

  return {
    scaleMDtoED: formatScaler(
      scaleLinear()
        .domain(rowData.measuredDepths)
        .range(rowData.equivalentDepartures),
      Fixed.TwoDecimals
    ),
    scaleTVDtoED: formatScaler(
      scaleLinear()
        .domain(rowData.trueVerticalDepths)
        .range(rowData.equivalentDepartures),
      Fixed.TwoDecimals
    ),
    scaleMDtoInclination: formatScaler(
      scaleLinear().domain(rowData.measuredDepths).range(rowData.inclinations),
      Fixed.OneDecimal
    ),
    scaleTVDtoInclination: formatScaler(
      scaleLinear()
        .domain(rowData.trueVerticalDepths)
        .range(rowData.inclinations),
      Fixed.OneDecimal
    ),
  };
};

const formatScaler = (scaler: (value: number) => number, toFixed: Fixed) => {
  return (value: number) => {
    return toFixedNumberFromNumber(scaler(value), toFixed);
  };
};
