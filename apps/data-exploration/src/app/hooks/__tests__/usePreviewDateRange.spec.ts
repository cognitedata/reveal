import { renderHook, act } from '@testing-library/react';

import { TIME_SELECT } from '@data-exploration-lib/core';

import {
  TIMESERIES_TABLE_DATE_RANGE_KEY,
  TIMESERIES_PREVIEW_DATE_RANGE_KEY,
} from '../../utils/constants';
import * as URLUtils from '../../utils/URLUtils';
import { useDateRange } from '../storage/useDateRange';
import { usePreviewDateRange } from '../storage/usePreviewDateRange';

const TEST_DATE_RANGE = [
  '2021-03-07T12:11:17.000Z',
  '2023-03-07T12:11:17.000Z',
];

const testProject = 'test-project';
const mock = jest.spyOn(URLUtils, 'getProject').mockReturnValue(testProject);
const tableTestKey = `${testProject}-${TIMESERIES_TABLE_DATE_RANGE_KEY}`;
const previewTestKey = `${testProject}-${TIMESERIES_PREVIEW_DATE_RANGE_KEY}`;

describe('usePreviewDateRange', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date(TEST_DATE_RANGE[1]));
  });
  afterAll(() => {
    sessionStorage.clear();
    mock.mockRestore();
  });

  it('should set default date range', () => {
    const { result: dateRangeResult } = renderHook(() => usePreviewDateRange());
    const [dateRangeValue] = dateRangeResult.current;
    expect(dateRangeValue).toEqual(TIME_SELECT['2Y'].getTime());
  });
  it('should set date range according to useDateRange', () => {
    const { result: tableResult } = renderHook(() =>
      useDateRange(tableTestKey)
    );
    const [, setValue] = tableResult.current;
    const newValue = TIME_SELECT['1M'].getTime();
    act(() => {
      setValue(newValue);
    });

    const { result: previewResult } = renderHook(() =>
      usePreviewDateRange(tableTestKey, previewTestKey)
    );
    const [previewDateRange] = previewResult.current;
    expect(previewDateRange).toEqual(newValue);
  });

  it('should set custom date range', () => {
    const { result } = renderHook(() =>
      usePreviewDateRange(undefined, previewTestKey)
    );
    const [, setValue] = result.current;

    const newValue = TIME_SELECT['1D'].getTime();
    act(() => {
      setValue(newValue);
    });

    const storageValue = JSON.parse(
      sessionStorage.getItem(previewTestKey) || ''
    );
    const parsedDateRange: [Date, Date] = [
      new Date(storageValue[0]),
      new Date(storageValue[1]),
    ];

    expect(parsedDateRange).toEqual(newValue);
  });
});
