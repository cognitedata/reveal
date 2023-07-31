import { getRegionFilter } from '../getRegionFilter';

describe('getRegionFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getRegionFilter([])).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getRegionFilter(['test'])).toEqual({
      region: { isSet: true, oneOf: ['test'] },
    });
  });
});
