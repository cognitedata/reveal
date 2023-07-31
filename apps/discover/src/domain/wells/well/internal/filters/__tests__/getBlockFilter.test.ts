import { getBlockFilter } from '../getBlockFilter';

describe('getBlockFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getBlockFilter('')).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getBlockFilter(['test'])).toEqual({
      block: { isSet: true, oneOf: ['test'] },
    });
  });
});
