import { Data, data, xAccessor, yAccessor } from '__test-utils/fixtures/charts';

import { LegendCheckboxState } from '../common/Legend';
import { DEFAULT_COLOR, DEFAULT_NO_DATA_COLOR } from '../constants';
import {
  filterUndefinedValues,
  getValuesOfObjectsByKey,
  getSumOfValues,
  getSumOfValuesOfObjectsByKey,
  getFilteredData,
  getDefaultColorConfig,
} from '../utils';

describe('Charts -> utils', () => {
  it('should filter undefined values as expected', () => {
    const dataWithUndefined = [
      ...data,
      { label: 'LabelUndefined', group: 'GroupUndefined', count: undefined },
    ] as Data[];

    expect(filterUndefinedValues<Data>(dataWithUndefined, xAccessor)).toEqual(
      data
    );
  });

  it('should return values of objects for given key', () => {
    expect(getValuesOfObjectsByKey<Data>(data, xAccessor)).toEqual([
      50.25, 80, 30.5, 90.28, 20,
    ]);
  });

  it('should return the sum of values of numbers in the given array', () => {
    const values = getValuesOfObjectsByKey<Data>(data, xAccessor);
    expect(getSumOfValues<Data>(values)).toEqual(271.03);
  });

  it('should return the sum of values of objects for given key', () => {
    expect(getSumOfValuesOfObjectsByKey<Data>(data, xAccessor)).toEqual(271.03);
  });

  it('should filter data as per the checkbox state', () => {
    const checkboxState: LegendCheckboxState = {
      Label1: true,
      Label2: false,
    };

    expect(getFilteredData(data, yAccessor, checkboxState)).toEqual([
      { label: 'Label1', group: 'A', count: 50.25 },
      { label: 'Label1', group: 'B', count: 90.28 },
      { label: 'Label1', group: 'A', count: 20 },
    ]);
  });

  it('should return default color config as expected', () => {
    expect(getDefaultColorConfig()).toBeUndefined();
    expect(getDefaultColorConfig(yAccessor)).toEqual({
      colors: {},
      accessor: yAccessor,
      defaultColor: DEFAULT_COLOR,
      noDataColor: DEFAULT_NO_DATA_COLOR,
    });
  });
});
