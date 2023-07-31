import { getMeasurementFilter } from '../getMeasurementFilter';

describe('getMeasurementFilter', () => {
  it('should be ok empty', () => {
    expect(getMeasurementFilter()).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getMeasurementFilter(['test'])).toEqual({
      depthMeasurements: { measurementTypes: { containsAny: ['test'] } },
    });
  });

  it('should return empty object with invalid input', () => {
    expect(getMeasurementFilter('test')).toEqual({});
  });
});
