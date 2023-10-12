import React from 'react';

import { TIME_SELECT } from '@data-exploration-components/containers';

import {
  TIMESERIES_PREVIEW_DATE_RANGE_KEY,
  TIMESERIES_TABLE_DATE_RANGE_KEY,
} from '../../utils/constants';
import { getProject } from '../../utils/URLUtils';

import { useSessionStorage } from './useSessionStorage';

export const usePreviewDateRange = (
  tableSessionKey = `${getProject()}-${TIMESERIES_TABLE_DATE_RANGE_KEY}`,
  previewSessionKey = `${getProject()}-${TIMESERIES_PREVIEW_DATE_RANGE_KEY}`
): [[Date, Date], React.Dispatch<React.SetStateAction<[Date, Date]>>] => {
  const [timeseriesTableDateRange] =
    useSessionStorage<[Date, Date]>(tableSessionKey);

  // If no range is selected for preview, pick the one that is set for the table.
  const defaultPreviewDateRange =
    timeseriesTableDateRange || TIME_SELECT['2Y'].getTime();

  const [dateRange, setDateRange] = useSessionStorage<[Date, Date]>(
    previewSessionKey,
    defaultPreviewDateRange
  );

  const parsedDateRange: [Date, Date] = [
    new Date(dateRange[0]),
    new Date(dateRange[1]),
  ];

  return [parsedDateRange, setDateRange];
};
