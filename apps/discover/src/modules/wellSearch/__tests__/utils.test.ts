import get from 'lodash/get';
import round from 'lodash/round';
import { convertPressure } from 'utils/units';

import { Sequence } from '@cognite/sdk';

import {
  getMockWell,
  mockedWellboreResultFixture,
  mockWellboreOptions,
} from '__test-utils/fixtures/well';
import {
  CENTIMETER,
  FEET,
  MILLIMETER,
  METER,
  PPG,
  PSI,
  SG,
  UserPrefferedUnit,
} from 'constants/units';

import { TrajectoryColumnR, Well } from '../types';
import { convertObject, toBooleanMap, getRangeLimitInUnit } from '../utils';
import { mapWellboresToThreeD } from '../utils/threed';
import { getExistColumns } from '../utils/trajectory';

const cmToftFactor = 30.48;
const mmtoCmFactor = 10;
const field1 = 1000;
const field2 = 1500;
const dateWithFormatting = '11.Nov.2011';
const date = new Date(dateWithFormatting);
const fieldTimeStamp = date.getTime();

const initialObject = {
  id: 228326543706267,
  metadata: {
    field1: field1.toString(),
    field1_unit: FEET,
    field2: field2.toString(),
    field2_unit: MILLIMETER,
    fieldTimeStamp,
  },
};

const accessorObj1 = {
  accessor: 'metadata.field1',
  fromAccessor: 'metadata.field1_unit',
  to: CENTIMETER,
};

const accessorObj2 = {
  accessor: 'metadata.field2',
  fromAccessor: 'metadata.field2_unit',
  to: CENTIMETER,
};

const tvdInMeters = 5000;
const tvdInFeet = tvdInMeters * 3.281;
const ppgValue = 12;
const psiValue = 10237;
const sgValue = 1.44;

describe('convertObject builder', () => {
  it('should change the unit for given accessors.', () => {
    const covertedObjForunitChange = convertObject(initialObject)
      .changeUnits([accessorObj1, accessorObj2])
      .get();
    expect(
      Number(get(covertedObjForunitChange, 'metadata.field1')).toFixed(0)
    ).toEqual((field1 * cmToftFactor).toString());
    expect(
      Number(get(covertedObjForunitChange, 'metadata.field2')).toFixed(0)
    ).toEqual((field2 / mmtoCmFactor).toFixed(0).toString());
  });

  it('should not mutate the original object after change the unit for given accessors.', () => {
    convertObject(initialObject)
      .changeUnits([accessorObj1, accessorObj2])
      .get();
    expect(Number(get(initialObject, 'metadata.field1')).toFixed(0)).toEqual(
      field1.toString()
    );
  });

  it('should change the value to closest integer', () => {
    const covertedObjClostInteger = convertObject(initialObject)
      .toClosestInteger(['metadata.field1'])
      .get();

    expect(
      Number(get(covertedObjClostInteger, 'metadata.field1')).toFixed(0)
    ).toEqual(field1.toFixed(0).toString());
  });

  it('should not mutate after changing the value to closest integer.', () => {
    convertObject(initialObject).toClosestInteger(['metadata.field1']).get();

    expect(Number(get(initialObject, 'metadata.field1')).toFixed(0)).toEqual(
      field1.toString()
    );
  });

  it('should change the time-stamp value to date format dd.mm.yyyy', () => {
    const covertedObjClostInteger = convertObject(initialObject)
      .toDate(['metadata.fieldTimeStamp'])
      .get();
    expect(get(covertedObjClostInteger, 'metadata.fieldTimeStamp')).toEqual(
      dateWithFormatting
    );
  });

  it('should not mutate after changing the time-stamp value to date format dd.mm.yyyy', () => {
    convertObject(initialObject).toDate(['metadata.fieldTimeStamp']).get();
    expect(get(initialObject, 'metadata.fieldTimeStamp')).toEqual(
      fieldTimeStamp
    );
  });

  it('should add the new properties to object with add', () => {
    const covertedObjClostInteger = convertObject(initialObject)
      .add({ testProperty: 'test' })
      .get();
    expect(get(covertedObjClostInteger, 'testProperty')).toEqual('test');
  });

  it('should not mutate after adding the new properties to object with add', () => {
    convertObject(initialObject).add({ testProperty: 'test' }).get();
    expect(get(initialObject, 'testProperty')).toEqual(undefined);
  });
});

describe('Pressure Converter', () => {
  it('should convert psi to ppg', () => {
    const value = convertPressure(psiValue, PSI, tvdInMeters, METER, PPG);
    const valueForFeet = convertPressure(psiValue, PSI, tvdInFeet, FEET, PPG);
    expect(round(value)).toEqual(ppgValue);
    expect(round(valueForFeet)).toEqual(ppgValue);
  });
  it('should convert ppg to psi', () => {
    const value = convertPressure(ppgValue, PPG, tvdInMeters, METER, PSI);
    const valueForFeet = convertPressure(ppgValue, PPG, tvdInFeet, FEET, PSI);
    expect(round(value)).toEqual(psiValue);
    expect(round(valueForFeet)).toEqual(psiValue);
  });
  it('should convert ppg to sg', () => {
    const value = convertPressure(ppgValue, PPG, undefined, undefined, SG);
    expect(round(value, 2)).toEqual(sgValue);
  });
  it('should convert sg to ppg', () => {
    const value = convertPressure(sgValue, SG, undefined, undefined, PPG);
    expect(round(value)).toEqual(ppgValue);
  });
});

describe('Trajectory Utils', () => {
  it('should return columns only if exist in sequence', () => {
    const sequence = {
      id: 396678522851928,
      columns: [
        { name: 'md', externalId: 'md' },
        { name: 'inclination', externalId: 'inclination' },
        { name: 'azimuth', externalId: 'azimuth' },
        { name: 'tvd', externalId: 'tvd' },
        { name: 'dogleg_severity', externalId: 'dogleg_severity' },
      ],
    } as Sequence;
    const columns = [
      { name: 'md' },
      { name: 'azimuth' },
      { name: 'inclination' },
      { name: 'tvd' },
      { name: 'x_offset' },
      { name: 'y_offset' },
      {
        name: 'equivalent_departure',
      },
    ] as TrajectoryColumnR[];
    expect(getExistColumns(sequence, columns)).toEqual([
      { name: 'md' },
      { name: 'azimuth' },
      { name: 'inclination' },
      { name: 'tvd' },
    ]);
  });
});

describe('3D Component Utils', () => {
  it('should return wells in 3d format', () => {
    const wells: Well[] = [
      { ...getMockWell(), wellbores: mockedWellboreResultFixture },
    ];
    const results = mapWellboresToThreeD(wells);
    expect(results).toEqual([
      {
        description: 'wellbore B desc',
        id: 759155409324883,
        metadata: {
          bh_x_coordinate: '',
          bh_y_coordinate: '',
          elevation_type: 'KB',
          elevation_value: '',
          elevation_value_unit: '',
        },
        name: 'wellbore B',
        parentId: 1234,
        sourceWellbores: [],
        wellId: 1234,
        ...mockWellboreOptions,
      },
      {
        metadata: {
          bh_x_coordinate: '',
          bh_y_coordinate: '',
          elevation_type: 'KB',
          elevation_value: '',
          elevation_value_unit: '',
        },
        name: 'wellbore A',
        id: 759155409324993,
        externalId: 'Wellbore A:759155409324993',
        wellId: 1234,
        description: 'wellbore A desc',
        sourceWellbores: [
          {
            externalId: 'Wellbore A:759155409324993',
            id: 759155409324993,
            source: 'Source A',
          },
        ],
        parentId: 1234,
        ...mockWellboreOptions,
      },
    ]);
  });
});

describe('Common Utils', () => {
  it('should return boolean map from id list', () => {
    const results = toBooleanMap([1, 2], true);
    expect(results).toEqual({
      1: true,
      2: true,
    });
  });
});

describe('getRangeLimitInUnit', () => {
  it('should convert ft ranges into m', () => {
    expect(getRangeLimitInUnit(100, 1000, UserPrefferedUnit.METER)).toEqual([
      30, 305,
    ]);
  });

  it('should return same range back since no chagne of unit', () => {
    expect(getRangeLimitInUnit(100, 1000, UserPrefferedUnit.FEET)).toEqual([
      100, 1000,
    ]);
  });
});
