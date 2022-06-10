import { getWellTypeFilter } from '../getWellTypeFilter';

describe('getWellTypeFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getWellTypeFilter([])).toEqual({});
  });

  it('should return empty object with valid number tuple and undefined unit', () => {
    expect(getWellTypeFilter(['test'])).toEqual({
      wellType: { isSet: true, oneOf: ['test'] },
    });
  });
});
