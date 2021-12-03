import { Data, data } from '__test-utils/fixtures/charts';

import {
  sumObjectsByKey,
  fixValuesToDecimalPlaces,
  getStackedData,
} from '../utils';

describe('StackedBarChart -> utils', () => {
  it('should return the objects with sum of the values of given key', () => {
    expect(sumObjectsByKey<Data>(data, 'label', 'count')).toEqual([
      { label: 'Label1', group: 'A', count: 160.53 },
      { label: 'Label2', group: 'A', count: 110.5 },
    ]);
  });

  it('should return the objects with fixed decimal places', () => {
    expect(fixValuesToDecimalPlaces<Data>(data, 'count', 1)).toEqual([
      { label: 'Label1', group: 'A', count: 50.3 },
      { label: 'Label2', group: 'A', count: 80 },
      { label: 'Label2', group: 'B', count: 30.5 },
      { label: 'Label1', group: 'B', count: 90.3 },
      { label: 'Label1', group: 'A', count: 20 },
    ]);
  });

  it('should return data with stacked width as expected', () => {
    expect(getStackedData<Data>(data, 'count')).toEqual([
      { label: 'Label1', group: 'A', count: 20, stackedWidth: 20 },
      { label: 'Label2', group: 'B', count: 30.5, stackedWidth: 50.5 },
      { label: 'Label1', group: 'A', count: 50.25, stackedWidth: 100.75 },
      { label: 'Label2', group: 'A', count: 80, stackedWidth: 180.75 },
      { label: 'Label1', group: 'B', count: 90.28, stackedWidth: 271.03 },
    ]);
  });
});
