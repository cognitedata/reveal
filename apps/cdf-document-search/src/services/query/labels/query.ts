import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { fetchLabels } from '../../api';
import { LABELS_KEYS } from '../../constants';

export const useLabelsQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(LABELS_KEYS.labels(), () =>
    fetchLabels(sdk)
  );

  return { data, ...rest };
};
