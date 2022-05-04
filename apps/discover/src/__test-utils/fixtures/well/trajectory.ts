import { Trajectory } from '@cognite/sdk-wells-v3';

export const getMockTrajectory = (
  id: string,
  extras?: Partial<Trajectory>
): Trajectory => {
  return {
    wellboreMatchingId: id,
    wellboreAssetExternalId: id,
    maxInclination: 90,
    maxTrueVerticalDepth: 32,
    maxMeasuredDepth: 41,
    source: {
      sequenceExternalId: '1234',
      sourceName: '1234',
    },
    isDefinitive: true,
    maxDoglegSeverity: {
      unit: {
        angleUnit: 'degree',
        distanceUnit: 'meter',
      },
      value: 0,
    },
    ...extras,
  };
};
