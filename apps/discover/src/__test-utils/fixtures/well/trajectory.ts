import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

import { Trajectory } from '@cognite/sdk-wells';

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

export const getMockTrajectoryWithData = (
  id: string,
  extras?: Partial<TrajectoryWithData>
): TrajectoryWithData => {
  return {
    wellboreAssetExternalId: id,
    wellboreMatchingId: id,
    maxMeasuredDepth: 17194.035,
    maxTrueVerticalDepth: 16972.464,
    maxInclination: 23.9699997962953,
    maxDoglegSeverity: {
      unit: {
        angleUnit: 'deg',
        distanceUnit: 'm',
        distanceInterval: 30,
      },
      value: 341.90127699393923,
    },
    source: {
      sequenceExternalId: 'test-sequence-external-id',
      sourceName: 'test-source',
    },
    isDefinitive: true,
    type: 'Trajectory',
    measuredDepthUnit: 'ft',
    inclinationUnit: 'deg',
    azimuthUnit: 'deg',
    trueVerticalDepthUnit: 'ft',
    equivalentDepartureUnit: 'm',
    offsetUnit: 'm',
    doglegSeverityUnit: {
      angleUnit: 'deg',
      distanceUnit: 'm',
      distanceInterval: 30,
    },
    doglegSeverityIsComputed: false,
    rows: [
      {
        trueVerticalDepth: 6759.014,
        measuredDepth: 6759.014,
        northOffset: 0,
        eastOffset: 0,
        azimuth: 1.3586911733011078,
        inclination: 0,
        doglegSeverity: 0,
        equivalentDeparture: 0,
        northing: 27.22832642,
        easting: -90.032850022,
      },
      {
        trueVerticalDepth: 9369.959,
        measuredDepth: 9370.019,
        northOffset: 4.575176822556583,
        eastOffset: 0.8478491310459686,
        azimuth: 10.4986710462824,
        inclination: 0.669999994306128,
        doglegSeverity: 2.525651306793915,
        equivalentDeparture: 4.653073296937666,
        northing: 27.228367519512414,
        easting: -90.03284145649799,
      },
    ],
    ...extras,
  };
};
