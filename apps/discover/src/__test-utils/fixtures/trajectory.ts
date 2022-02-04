import { SequenceColumn } from '@cognite/sdk';
import {
  AngleUnitEnum,
  DistanceUnitEnum,
  TrajectoryData,
} from '@cognite/sdk-wells-v3';

import { TrajectoryRows } from 'modules/wellSearch/types';

import { createdAndLastUpdatedTime } from './log';

export const getMockedTrajectoryData = (): TrajectoryRows[] => {
  return [
    {
      id: 1,
      externalId: '0',
      columns: [{ name: 'Depth', valueType: 'string', externalId: '0' }],
      rows: [{ rowNumber: 0, values: [0, 1] }],
      wellboreId: 759155409324883,
    },
  ];
};

export const getMockSequenceData: (
  extras?: Partial<SequenceColumn>
) => SequenceColumn = (extras = {}) => {
  return {
    name: 'Depth',
    valueType: 'STRING',
    id: 1,
    ...createdAndLastUpdatedTime,
    ...extras,
  };
};

export const mockedTrajectoryDataV3 = (): TrajectoryData => {
  return {
    wellboreAssetExternalId: 'test-id',

    wellboreMatchingId: 'wellbore-id',
    source: { sequenceExternalId: '', sourceName: '' },

    measuredDepthUnit: DistanceUnitEnum.Meter,
    inclinationUnit: AngleUnitEnum.Degree,
    azimuthUnit: AngleUnitEnum.Degree,
    trueVerticalDepthUnit: DistanceUnitEnum.Meter,
    equivalentDepartureUnit: DistanceUnitEnum.Meter,
    offsetUnit: DistanceUnitEnum.Meter,
    doglegSeverityUnit: {
      angleUnit: AngleUnitEnum.Degree,
      distanceUnit: DistanceUnitEnum.Meter,
      distanceInterval: 30,
    },
    doglegSeverityIsComputed: true,
    rows: [
      {
        trueVerticalDepth: 0,
        measuredDepth: 0,
        northOffset: 0,
        eastOffset: 0,
        azimuth: 0,
        inclination: 0,
        doglegSeverity: 0,
        equivalentDeparture: 0,
        northing: 65.909443,
        easting: -8.768405,
      },
    ],
  };
};
