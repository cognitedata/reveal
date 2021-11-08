import { Data, data } from '__test-utils/fixtures/stackedBarChart';

import {
  getValuesOfObjectsByKey,
  getSumOfValues,
  getSumOfValuesOfObjectsByKey,
} from '../utils';

describe('StackedBarChart -> utils', () => {
  it('should return values of objects for given key', () => {
    expect(getValuesOfObjectsByKey<Data>(data, 'count')).toEqual([
      50.25, 80, 30.5, 90.28, 20,
    ]);
  });

  it('should return the sum of values of numbers in the given array', () => {
    const values = getValuesOfObjectsByKey<Data>(data, 'count');
    expect(getSumOfValues<Data>(values)).toEqual(271.03);
  });

  it('should return the sum of values of objects for given key', () => {
    expect(getSumOfValuesOfObjectsByKey<Data>(data, 'count')).toEqual(271.03);
  });
});
