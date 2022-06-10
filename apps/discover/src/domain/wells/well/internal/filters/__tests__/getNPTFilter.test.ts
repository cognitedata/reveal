import { getNPTFilter } from '../getNPTFilter';

describe('getNPTFilter', () => {
  it('should return empty object with empty input', () => {
    expect(getNPTFilter([])).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getNPTFilter(['test'])).toEqual({
      npt: { exists: true, nptCodes: { containsAll: ['test'] } },
    });
  });

  it('should return empty object with invalid input', () => {
    expect(getNPTFilter('test')).toEqual({});
  });
});
