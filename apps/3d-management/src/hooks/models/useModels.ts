import { useQuery, useQueryCache } from 'react-query';
import sdk from '@cognite/cdf-sdk-singleton';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';
import { HttpError, Model3D } from '@cognite/sdk';

const fetchModels = (): Promise<Model3D[]> => {
  return sdk.models3D.list().autoPagingToArray({ limit: Infinity });
};

export function useModels() {
  const queryCache = useQueryCache();
  const queryKey = QUERY_KEY.MODELS;

  return useQuery<Model3D[], HttpError>({
    queryKey,
    queryFn: fetchModels,
    config: {
      refetchOnMount: false,
      initialData: () => queryCache.getQueryData(queryKey),
      onError: (error) => {
        fireErrorNotification({ error, message: 'Could not fetch the models' });
      },
    },
  });
}
