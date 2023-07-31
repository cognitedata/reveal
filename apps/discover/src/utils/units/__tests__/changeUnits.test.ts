import get from 'lodash/get';

import { CENTIMETER, FEET, METER, MILLIMETER } from 'constants/units';

import { changeUnits } from '../changeUnits';

const cmToftFactor = 30.48;
const mmToCmFactor = 10;
const field1 = 1000;
const field2 = 1500;
const field3 = 100;

const initialObject = {
  id: 228326543706267,
  metadata: {
    field1: field1.toString(),
    field1_unit: FEET,
    field2: field2.toString(),
    field2_unit: MILLIMETER,
    field3: field3.toString(),
    field3_unit: METER,
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

describe('change units', () => {
  const covertedObjForAccessors = changeUnits(initialObject, [
    accessorObj1,
    accessorObj2,
  ]);

  it('should not mutate the original object.', () => {
    expect(Number(get(initialObject, 'metadata.field1')).toFixed(0)).toEqual(
      field1.toString()
    );
  });

  it('should change the units for given accessors.', () => {
    expect(
      Number(get(covertedObjForAccessors, 'metadata.field1')).toFixed(0)
    ).toEqual((field1 * cmToftFactor).toString());

    expect(
      Number(get(covertedObjForAccessors, 'metadata.field2')).toFixed(0)
    ).toEqual((field2 / mmToCmFactor).toFixed(0).toString());
  });

  it('should not mutate the original object after change units.', () => {
    expect(Number(get(initialObject, 'metadata.field1')).toFixed(0)).toEqual(
      field1.toString()
    );

    expect(Number(get(initialObject, 'metadata.field2')).toFixed(0)).toEqual(
      field2.toString()
    );
  });
});
