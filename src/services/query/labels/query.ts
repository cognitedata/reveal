import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { fetchLabels } from 'src/services/api';
import { LABELS_KEYS } from 'src/services/constants';

export const useLabelsQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(LABELS_KEYS.labels(), () =>
    fetchLabels(sdk)
  );

  return { data, ...rest };
};
