import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { fetchLabels } from 'services/api';
import { LABELS_KEYS } from 'services/constants';

export const useLabelsQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(LABELS_KEYS.labels(), () =>
    fetchLabels(sdk)
  );

  return { data, ...rest };
};
