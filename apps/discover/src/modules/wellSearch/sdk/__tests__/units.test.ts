import { DistanceUnitEnum } from '@cognite/sdk-wells-v3';

import { FEET, METER, CENTIMETER } from 'constants/units';

import { unitToLengthUnitEnum } from '../utils';

describe('unitToLengthUnitEnum utility funciton', () => {
  it('Should return `FOOT` enum value', async () => {
    expect(unitToLengthUnitEnum(FEET)).toBe(DistanceUnitEnum.Foot);
  });
  it('Should return `METER` enum value', async () => {
    expect(unitToLengthUnitEnum(METER)).toBe(DistanceUnitEnum.Meter);
  });
  it('Should throw and error', async () => {
    expect(() => unitToLengthUnitEnum(CENTIMETER)).toThrowError(
      `Unit (${CENTIMETER}) is not supported by sdk`
    );
  });
});
