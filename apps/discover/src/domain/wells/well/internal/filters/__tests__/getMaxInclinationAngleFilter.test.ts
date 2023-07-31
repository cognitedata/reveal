import { getMaxInclinationAngleFilter } from '../getMaxInclinationAngleFilter';

describe('getMaxInclinationAngleFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getMaxInclinationAngleFilter('')).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getMaxInclinationAngleFilter([10, 20])).toEqual({
      trajectories: { maxInclination: { min: 10, max: 20, unit: 'degree' } },
    });
  });
});
