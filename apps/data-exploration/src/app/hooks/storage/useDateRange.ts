import React from 'react';

import { TIME_SELECT } from '@data-exploration-lib/core';

import { TIMESERIES_TABLE_DATE_RANGE_KEY } from '../../utils/constants';
import { getProject } from '../../utils/URLUtils';

import { useSessionStorage } from './useSessionStorage';

export const useDateRange = (
  sessionKey = `${getProject()}-${TIMESERIES_TABLE_DATE_RANGE_KEY}`
): [[Date, Date], React.Dispatch<React.SetStateAction<[Date, Date]>>] => {
  const [dateRange, setDateRange] = useSessionStorage<[Date, Date]>(
    sessionKey,
    TIME_SELECT['2Y'].getTime()
  );

  const parsedDateRange: [Date, Date] = [
    new Date(dateRange[0]),
    new Date(dateRange[1]),
  ];

  return [parsedDateRange, setDateRange];
};
