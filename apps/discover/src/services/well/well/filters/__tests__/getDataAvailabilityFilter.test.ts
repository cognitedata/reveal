import {
  DataAvailabilityOptions,
  getDataAvailabilityFilter,
} from '../getDataAvailabilityFilter';

/**
 * DataAvailabilityOption map with WellFilter attribute.
 */
const FILTER_ATTRIBUTE_MAP: Record<DataAvailabilityOptions, string> = {
  [DataAvailabilityOptions.Trajectories]: 'trajectories',
  [DataAvailabilityOptions.NDS]: 'nds',
  [DataAvailabilityOptions.NPT]: 'npt',
  [DataAvailabilityOptions.Casings]: 'casings',
};

describe('getDataAvailabilityFilter', () => {
  it('should be ok empty', () => {
    expect(getDataAvailabilityFilter([])).toEqual({}); // Passing an empty array
    expect(getDataAvailabilityFilter({})).toEqual({}); // Passing a non-array
  });

  test.each(Object.values(DataAvailabilityOptions))(
    'should be ok with %p',
    (filter) => {
      expect(JSON.stringify(getDataAvailabilityFilter([filter]))).toContain(
        FILTER_ATTRIBUTE_MAP[filter]
      );
    }
  );
});
