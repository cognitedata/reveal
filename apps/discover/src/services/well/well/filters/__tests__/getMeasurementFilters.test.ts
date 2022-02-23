import { getMeasurementFilter } from '../getMeasurementFilter';

describe('getMeasurementFilter', () => {
  it('should be ok empty', () => {
    expect(getMeasurementFilter()).toEqual({});
  });
});
