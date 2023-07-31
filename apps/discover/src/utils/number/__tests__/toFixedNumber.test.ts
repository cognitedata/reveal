import { ERROR_INVALID_DATA } from 'constants/error';

import { toFixedNumber } from '../toFixedNumber';

describe('toFixedNumber', () => {
  it('converts the string (number) to 3 digit points', () => {
    const result = toFixedNumber('0.523423423');

    expect(result).toBe(0.523);
  });

  it('converts the string (number) to 2 digit points', () => {
    const result = toFixedNumber('0.523423423', 2);

    expect(result).toBe(0.52);
  });

  it('converts the number to 2 decimals', () => {
    const result = toFixedNumber(0.167, 2);

    expect(result).toBe(0.17);
  });

  it(`returns '${ERROR_INVALID_DATA}' on random string`, () => {
    const result = toFixedNumber('random string');

    expect(result).toBe(ERROR_INVALID_DATA);
  });
});
