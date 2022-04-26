import { toFixedNumberFromNumber } from '../toFixedNumberFromNumber';

describe('toFixedNumberFromNumber', () => {
  it('should fix number', () => {
    expect(toFixedNumberFromNumber(1)).toEqual(1);
    expect(toFixedNumberFromNumber(1.62499, 0)).toEqual(2);
    expect(toFixedNumberFromNumber(1.62499, 1)).toEqual(1.6);
    expect(toFixedNumberFromNumber(1.62499, 2)).toEqual(1.62);
    expect(toFixedNumberFromNumber(1.62499, 3)).toEqual(1.625);
  });

  // As a safety measure if the default value of `decimalPlaces` is changed.
  it('should fix number to 3 by default', () => {
    expect(toFixedNumberFromNumber(1.62499)).toEqual(1.625);
  });
});
