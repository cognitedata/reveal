import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';

const getDataSets = async () => {
  return (await sdk.datasets.list().autoPagingToArray({ limit: -1 })).filter(
    (el) => !el.metadata || !el.metadata['archived']
  );
};

export const useDataSets = () => useQuery(['get-datasets'], getDataSets);
