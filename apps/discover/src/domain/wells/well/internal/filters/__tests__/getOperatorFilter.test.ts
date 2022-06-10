import { getOperatorFilter } from '../getOperatorFilter';

describe('getOperatorFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getOperatorFilter('')).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getOperatorFilter(['test'])).toEqual({
      operator: { isSet: true, oneOf: ['test'] },
    });
  });
});
