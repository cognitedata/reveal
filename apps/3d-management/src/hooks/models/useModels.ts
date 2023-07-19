import { useQuery, useQueryClient } from '@tanstack/react-query';

import { CogniteClient, HttpError, Model3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { fireErrorNotification, QUERY_KEY } from '../../utils';

const fetchModels = (sdk: CogniteClient): Promise<Model3D[]> => {
  return sdk.models3D.list().autoPagingToArray({ limit: Infinity });
};

export function useModels(opts: { enabled: boolean } = { enabled: true }) {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEY.MODELS;
  const sdk = useSDK();

  return useQuery<Model3D[], HttpError>(queryKey, () => fetchModels(sdk), {
    keepPreviousData: true,
    refetchOnMount: false,
    initialData: () => queryClient.getQueryData(queryKey),
    onError: (error) => {
      fireErrorNotification({ error, message: 'Could not fetch the models' });
    },
    enabled: opts.enabled,
  });
}
