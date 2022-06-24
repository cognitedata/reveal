import { Datum } from 'plotly.js';

import { SequenceColumn } from '@cognite/sdk';
import {
  AngleUnitEnum,
  DistanceUnitEnum,
  TrajectoryData,
} from '@cognite/sdk-wells-v3';

import { Sequence, TrajectoryRows } from 'modules/wellSearch/types';
import {
  DimensionType,
  ThreeDCoordinate,
} from 'pages/authorized/search/well/inspect/modules/trajectory/Trajectory2D/types';

import { createdAndLastUpdatedTime } from './log';

export const getMockedTrajectoryData = (): TrajectoryRows[] => {
  return [
    {
      id: 1,
      externalId: '0',
      columns: [{ name: 'Depth', valueType: 'string', externalId: '0' }],
      rows: [{ rowNumber: 0, values: [0, 1] }],
      wellboreId: '759155409324883',
    },
  ];
};

export const getMockedTrajectoryDataItem = (
  extras?: Partial<TrajectoryRows>
): TrajectoryRows => {
  return {
    id: 1,
    externalId: '0',
    columns: [{ name: 'Depth', valueType: 'string', externalId: '0' }],
    rows: [{ rowNumber: 0, values: [0, 1] }],
    wellboreId: '759155409324883',
    ...extras,
  };
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

export const getMockSequence: (extras?: Partial<Sequence>) => Sequence[] =
  () => {
    return [
      {
        id: 1,
        columns: [
          {
            id: 1,
            externalId: 'inclination',
            valueType: 'DOUBLE',
            name: 'inclination',
            metadata: {
              unit: 'degree',
            },
            ...createdAndLastUpdatedTime,
          },
          {
            id: 2,
            externalId: 'x_offset',
            valueType: 'DOUBLE',
            name: 'x_offset',
            metadata: {
              unit: 'meter',
            },
            ...createdAndLastUpdatedTime,
          },
          {
            id: 3,
            externalId: 'y_offset',
            valueType: 'DOUBLE',
            name: 'y_offset',
            metadata: {
              unit: 'meter',
            },
            ...createdAndLastUpdatedTime,
          },
          {
            id: 4,
            name: 'md',
            externalId: 'md',
            valueType: 'DOUBLE',
            metadata: {
              unit: 'meter',
            },
            ...createdAndLastUpdatedTime,
          },
          {
            id: 5,
            name: 'azimuth',
            externalId: 'azimuth',
            valueType: 'DOUBLE',
            metadata: {
              unit: 'degree',
            },
            ...createdAndLastUpdatedTime,
          },
        ],
        assetId: '0',
        name: 'ophiuchus',
        externalId: '0',
        metadata: {
          parentExternalId: 'wellbore-1',
          source: 'ophiuchus',
          bh_md: '2295.99',
          bh_md_unit: 'meter',
          bh_tvd: '2284.153823209608',
          bh_tvd_unit: 'meter',
          wellName: 'OPH27629332',
          wellboreName: 'Test Wellbore 1',
        },
        ...createdAndLastUpdatedTime,
      },
    ];
  };

export const mockedNormalizedColumns = (
  extras?: Record<string, string>
): Record<string, string> => {
  return {
    x_offset: 'x_offset',
    md: 'md',
    inclination: 'inclination',
    tvd: 'tvd',
    y_offset: 'y_offset',
    azimuth: 'azimuth',
    ed: 'equivalent_departure',
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

export const mockCoordinates = (): Array<Array<ThreeDCoordinate<Datum>>> => {
  return [
    [
      {
        x: {
          dimentionType: DimensionType.TWOD,
          data: 0,
        },
        y: {
          dimentionType: DimensionType.TWOD,
          data: 0,
        },
        z: undefined,
      },
      {
        x: {
          dimentionType: DimensionType.TWOD,
          data: 5,
        },
        y: {
          dimentionType: DimensionType.TWOD,
          data: 10,
        },
        z: undefined,
      },
      {
        x: {
          dimentionType: DimensionType.TWOD,
          data: undefined,
          error: {
            message: 'Error message',
          },
        },
        y: {
          dimentionType: DimensionType.TWOD,
          data: 12,
        },
        z: {
          dimentionType: DimensionType.THREED,
          data: 5,
        },
      },
      {
        x: {
          dimentionType: DimensionType.TWOD,
          data: 10,
        },
        y: {
          dimentionType: DimensionType.TWOD,
          data: 12,
        },
        z: {
          dimentionType: DimensionType.THREED,
          data: 5,
        },
      },
    ],
    [
      {
        x: {
          dimentionType: DimensionType.TWOD,
          data: 0,
        },
        y: {
          dimentionType: DimensionType.TWOD,
          data: 0,
        },
        z: undefined,
      },
      {
        x: {
          dimentionType: DimensionType.TWOD,
          data: 5,
        },
        y: {
          dimentionType: DimensionType.TWOD,
          data: 15,
        },
        z: undefined,
      },
      {
        x: {
          dimentionType: DimensionType.TWOD,
          data: 6,
        },
        y: {
          dimentionType: DimensionType.TWOD,
          data: 12,
        },
        z: {
          dimentionType: DimensionType.THREED,
          data: 5,
        },
      },
      {
        x: {
          dimentionType: DimensionType.TWOD,
          data: 10,
        },
        y: {
          dimentionType: DimensionType.TWOD,
          data: 16,
        },
        z: {
          dimentionType: DimensionType.THREED,
          data: 7,
        },
      },
    ],
  ];
};
