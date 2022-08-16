import { toDate } from 'utils/date';

import { Range } from '@cognite/cogs.js';

import { DocumentsFacets } from 'modules/documentSearch/types';

import { DateTabType } from '../types';

export const syncDatesWithSavedSearch = (
  key: DateTabType,
  dateState: Range,
  initialDateState: Range,
  filters: DocumentsFacets,
  setDateState: (value: Range) => void
) => {
  if (!dateState.startDate || !dateState.endDate) {
    return;
  }
  // No filters applied for this date (i.e., created or modified)

  if (((filters && filters[key]) || []).length !== 2) {
    setDateState(initialDateState);
    return;
  }

  // Array of epoch time from API (min, max).
  const [startDate, endDate] = filters[key];
  // Convert to Date
  const parsedStartDate = toDate(Number(startDate));
  const parsedEndDate = toDate(Number(endDate));

  if (
    parsedStartDate.valueOf() !== dateState.startDate.valueOf() ||
    parsedEndDate.valueOf() !== dateState.endDate.valueOf()
  ) {
    // If the parsed date's from the saved search is not equal, update state
    setDateState({
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });
  }
};
