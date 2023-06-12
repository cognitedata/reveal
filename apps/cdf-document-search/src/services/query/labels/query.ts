import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { fetchLabels } from 'apps/cdf-document-search/src/services/api';
import { LABELS_KEYS } from 'apps/cdf-document-search/src/services/constants';

export const useLabelsQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(LABELS_KEYS.labels(), () =>
    fetchLabels(sdk)
  );

  return { data, ...rest };
};
