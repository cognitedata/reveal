/**
 * Events effect
 *
 * Get data from sdk, store it to recoil
 */

import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useDebounce } from 'use-debounce';
import { isEqual } from 'lodash';
import { getTime } from 'date-fns';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { EventFilter, CogniteClient } from '@cognite/sdk';

import chartAtom from 'models/chart/atom';
import { ChartEventFilters } from 'models/chart/types';
import { eventResultsAtom } from 'models/event-results/atom';
import { transformNewFilterToOldFilter } from 'components/EventSidebar/helpers';

export function EventResultEffects() {
  const [chart] = useRecoilState(chartAtom);
  const [eventResults, setChartEventResults] = useRecoilState(eventResultsAtom);

  const eventFiltersElements = chart?.eventFilters?.map((eventFilter) => (
    <EventEffects eventFilter={eventFilter} key={eventFilter.id} />
  ));

  useEffect(() => {
    if (!eventFiltersElements?.length && eventResults.length)
      setChartEventResults([]);
  }, [chart, setChartEventResults, eventFiltersElements]);

  return <>{eventFiltersElements}</>;
}

function EventEffects({ eventFilter }: { eventFilter: ChartEventFilters }) {
  const [chart] = useRecoilState(chartAtom);
  const [, setChartEventResults] = useRecoilState(eventResultsAtom);
  const sdk = useSDK();

  const { dateFrom, dateTo } = chart!;
  const [debouncedRange] = useDebounce({ dateFrom, dateTo }, 50, {
    equalityFn: (l, r) => isEqual(l, r),
  });

  const query: EventFilter = {
    ...eventFilter.filters,
    startTime: { min: getTime(new Date(debouncedRange.dateFrom)) },
    endTime: { max: getTime(new Date(debouncedRange.dateTo)) },
  };

  const { data, isFetching, isSuccess } = useQuery(
    ['chart-data', 'events', eventFilter.id, query],
    () => fetchEventResults(sdk, query),
    {
      enabled: !!eventFilter.id,
    }
  );

  useEffect(() => {
    setChartEventResults((oldCollection) => {
      const existingEntry = oldCollection.find(
        (entry) => entry.id === eventFilter.id
      );

      // Clean up deleted events
      const activeFilters = oldCollection.filter((c) =>
        chart?.eventFilters?.some((item) => item.id === c.id)
      );

      const output = activeFilters
        .filter((entry) => entry.id !== eventFilter.id)
        .concat({
          ...eventFilter,
          results: isSuccess ? data?.items : existingEntry?.results,
          isLoading: isFetching,
        });

      return output;
    });
  }, [
    isSuccess,
    isFetching,
    data,
    chart,
    eventFilter.id,
    setChartEventResults,
  ]);

  return null;
}

function fetchEventResults(sdk: CogniteClient, query: EventFilter) {
  return sdk.events.list({
    limit: 1000,
    filter: transformNewFilterToOldFilter(query),
  });
}
