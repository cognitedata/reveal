import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { fetchLabels } from 'services/api';
import { LABELS_QUERY_KEYS } from 'services/constants';

export const useLabelsQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(LABELS_QUERY_KEYS.list, () =>
    fetchLabels(sdk)
  );

  return { data, ...rest };
};
