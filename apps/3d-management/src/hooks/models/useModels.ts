import { useQuery, useQueryCache } from 'react-query';
import { v3, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

const fetchModels = (): Promise<v3.Model3D[]> => {
  return sdk.models3D.list().autoPagingToArray({ limit: Infinity });
};

export function useModels() {
  const queryCache = useQueryCache();
  const queryKey = QUERY_KEY.MODELS;

  return useQuery<v3.Model3D[], v3.HttpError>({
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
