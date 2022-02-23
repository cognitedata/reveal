import {
  DataAvailabilityOptions,
  getDataAvailabilityFilter,
} from '../getDataAvailabilityFilter';

describe('getDataAvailabilityFilter', () => {
  it('should be ok empty', () => {
    expect(getDataAvailabilityFilter([])).toEqual({});
  });
  it('should be ok with trajectories', () => {
    expect(
      // trying not to test the implementation details
      // but something a bit generic
      JSON.stringify(
        getDataAvailabilityFilter([DataAvailabilityOptions.Trajectories])
      )
    ).toContain('trajectories');
  });
});
