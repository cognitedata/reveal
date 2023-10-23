import { renderHook, act } from '@testing-library/react';

import { TIME_SELECT } from '@data-exploration-lib/core';

import { TIMESERIES_TABLE_DATE_RANGE_KEY } from '../../utils/constants';
import * as URLUtils from '../../utils/URLUtils';
import { useDateRange } from '../storage/useDateRange'; // don't change import, otherwise test fails

const TEST_DATE_RANGE = [
  '2021-03-07T12:11:17.000Z',
  '2023-03-07T12:11:17.000Z',
];

const testProject = 'test-project';
const mock = jest.spyOn(URLUtils, 'getProject').mockReturnValue(testProject);
const testKey = `${testProject}-${TIMESERIES_TABLE_DATE_RANGE_KEY}`;

describe('useDateRange', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date(TEST_DATE_RANGE[1]));
  });
  afterAll(() => {
    sessionStorage.clear();
    mock.mockRestore();
  });

  it('should set default date range', () => {
    const { result: dateRangeResult } = renderHook(() => useDateRange());
    const [dateRangeValue] = dateRangeResult.current;
    expect(dateRangeValue).toEqual(TIME_SELECT['2Y'].getTime());
  });

  it('should set custom date range', () => {
    const { result } = renderHook(() => useDateRange(testKey));
    const [, setValue] = result.current;

    const newValue = TIME_SELECT['1Y'].getTime();
    act(() => {
      setValue(newValue);
    });

    const storageValue = JSON.parse(sessionStorage.getItem(testKey) || '');
    const parsedDateRange: [Date, Date] = [
      new Date(storageValue[0]),
      new Date(storageValue[1]),
    ];

    expect(parsedDateRange).toEqual(newValue);
  });
});
