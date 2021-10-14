import { LengthUnitEnum } from '@cognite/sdk-wells-v2';

import { FEET, METER, CENTIMETER } from 'constants/units';

import { unitToLengthUnitEnum } from '../utils';

describe('unitToLengthUnitEnum utility funciton', () => {
  it('Should return `FOOT` enum value', async () => {
    expect(unitToLengthUnitEnum(FEET)).toBe(LengthUnitEnum.FOOT);
  });
  it('Should return `METER` enum value', async () => {
    expect(unitToLengthUnitEnum(METER)).toBe(LengthUnitEnum.METER);
  });
  it('Should throw and error', async () => {
    expect(() => unitToLengthUnitEnum(CENTIMETER)).toThrowError(
      `Unit (${CENTIMETER}) is not supported by sdk`
    );
  });
});
