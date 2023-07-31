import {
  DATA_AVAILABILITY_OPTIONS,
  DATA_AVAILABILITY_OPTIONS_LABELS,
  DATA_AVAILABILITY_OPTIONS_LABELS_INVERT,
  getDataAvailabilityFilter,
} from '../getDataAvailabilityFilter';

describe('getDataAvailabilityFilter', () => {
  it('should be ok empty', () => {
    expect(getDataAvailabilityFilter([])).toEqual({}); // Passing an empty array
    expect(getDataAvailabilityFilter({})).toEqual({}); // Passing a non-array
  });

  test.each(Object.values(DATA_AVAILABILITY_OPTIONS_LABELS))(
    'should be ok with %p',
    (filter) => {
      expect(JSON.stringify(getDataAvailabilityFilter([filter]))).toContain(
        DATA_AVAILABILITY_OPTIONS[
          DATA_AVAILABILITY_OPTIONS_LABELS_INVERT[filter]
        ]
      );
    }
  );
});
