import { useQuery } from '@tanstack/react-query';
import { fetchLabels } from '../../api';
import { LABELS_KEYS } from '../../constants';

import { useSDK } from '@cognite/sdk-provider';

export const useLabelsQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(LABELS_KEYS.labels(), () =>
    fetchLabels(sdk)
  );

  return { data, ...rest };
};
