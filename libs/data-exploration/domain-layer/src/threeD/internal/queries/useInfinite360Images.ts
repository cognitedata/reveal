import { useMemo } from 'react';
import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';
import {
  InternalEventsData,
  useEventsSearchResultQuery,
} from '../../../events';
import { DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT } from '../../../constants';
import { InternalEventWithMetadata } from '../types';

export const useInfinite360Images = () => {
  const eventSearchConfig = useGetSearchConfigFromLocalStorage('event');
  const {
    data: images360Datasets,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }: {
    data: InternalEventsData[];
    hasNextPage?: boolean;
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
  } = useEventsSearchResultQuery(
    {
      eventsFilters: {
        type: 'scan',
      },
      limit: DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
    },
    eventSearchConfig,
    undefined
  );

  const images360Data = useMemo(() => {
    if (images360Datasets.length > 0) {
      const results = (images360Datasets as InternalEventWithMetadata[]).reduce(
        (accum, current) => {
          if (
            current.metadata?.site_id &&
            !Object.hasOwn(accum, current.metadata.site_id)
          ) {
            accum[current.metadata.site_id] = {
              siteId: current.metadata.site_id,
              siteName: current.metadata?.site_name ?? current.metadata.site_id,
            };
          }

          return accum;
        },
        {} as {
          [key: string]: { siteId: string; siteName: string };
        }
      );

      return Object.values(results);
    }

    return [];
  }, [images360Datasets]);

  return {
    images360Data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};
