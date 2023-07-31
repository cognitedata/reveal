import { TrajectoryDataRow } from '@cognite/sdk-wells';

export const trajectoryDataRow = (
  extras: TrajectoryDataRow[] = []
): TrajectoryDataRow[] => {
  return [
    {
      trueVerticalDepth: 261.19,
      measuredDepth: 261.25,
      northOffset: 4.48,
      eastOffset: 0.016,
      azimuth: 0.2802,
      inclination: 2.3345,
      doglegSeverity: 0.3687,
      equivalentDeparture: 4.48,
      northing: 58.81,
      easting: 2.1183,
    },
    ...extras,
  ];
};
