import { getFieldFilter } from '../getFieldFilter';

describe('getFieldFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getFieldFilter('')).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getFieldFilter(['test'])).toEqual({
      field: { isSet: true, oneOf: ['test'] },
    });
  });
});
