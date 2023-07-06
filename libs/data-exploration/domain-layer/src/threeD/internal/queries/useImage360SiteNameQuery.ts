import { UseInfiniteQueryOptions } from '@tanstack/react-query';

import { useEventsListQuery } from '../../../events';

export const useImage360SiteNameQuery = (
  siteId: string,
  options?: UseInfiniteQueryOptions
) => {
  const { data, ...rest } = useEventsListQuery(
    {
      filter: {
        metadata: {
          site_id: siteId,
        },
      },
      limit: 1,
    },
    {
      enabled: !!siteId,
      keepPreviousData: true,
      ...options,
    }
  );

  let siteName = siteId;

  if (data.length && data[0].metadata && data[0].metadata['site_name']) {
    siteName = data[0].metadata['site_name'];
  }

  return { data: siteName, ...rest };
};
