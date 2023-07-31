import { getMockGroupedNpt } from 'domain/wells/npt/service/__fixtures/getMockGroupedNpt';

import { sortDictionaryByValuesLength } from '../sortDictionaryByValuesLength';

describe('sortDictionaryByValuesLength', () => {
  it('should return expected result with empty input', () => {
    expect(sortDictionaryByValuesLength({})).toEqual({});
  });

  it('should return length based sorted result', () => {
    const mockGroupedNpt = getMockGroupedNpt();
    const result = sortDictionaryByValuesLength(mockGroupedNpt);

    expect(Object.keys(result)[0]).toEqual(Object.keys(mockGroupedNpt)[2]);
    expect(Object.keys(result)[1]).toEqual(Object.keys(mockGroupedNpt)[0]);
    expect(Object.keys(result)[2]).toEqual(Object.keys(mockGroupedNpt)[1]);
  });
});
