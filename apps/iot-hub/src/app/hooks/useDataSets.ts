import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';

import { QUERY_KEY } from '.';

export const useDataSets = () =>
  useQuery(QUERY_KEY.GET_DATA_SETS(), async () => {
    return (await sdk.datasets.list().autoPagingToArray()).filter(
      (el) => !el.metadata || !el.metadata['archived']
    );
  });
