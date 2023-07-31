import { getNPTDurationFilter } from '../getNPTDurationFilter';

describe('getNPTDurationFilter', () => {
  it('should return empty object with empty input', () => {
    expect(getNPTDurationFilter([])).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getNPTDurationFilter(['test'])).toEqual({
      npt: {
        exists: true,
        duration: { min: 'test', max: undefined, unit: 'hour' },
      },
    });
  });

  it('should return empty object with invalid input', () => {
    expect(getNPTDurationFilter('test')).toEqual({});
  });
});
