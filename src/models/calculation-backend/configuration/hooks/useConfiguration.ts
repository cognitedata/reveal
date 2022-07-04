import { Configuration } from '@cognite/calculation-backend';
import { useSDK } from '@cognite/sdk-provider';
import { useCluster } from 'hooks/config';
import useSearchParams from 'hooks/useSearchParams';
import { BACKEND_SERVICE_URL_KEY } from 'utils/constants';
import getServiceBaseUrl from '../utils/getServiceBaseUrl';

export default function useConfiguration() {
  const sdk = useSDK();
  const { Authorization } = sdk.getDefaultRequestHeaders();
  if (!Authorization) throw new Error('Authorization header missing');
  const accessToken = Authorization.replace('Bearer ', '');

  const [cluster] = useCluster();
  const searchParams = useSearchParams();

  /** Custom backend URL parse */
  const backendServiceBaseUrlFromQuery = searchParams.get(
    BACKEND_SERVICE_URL_KEY
  );

  const config = new Configuration({
    basePath: backendServiceBaseUrlFromQuery ?? getServiceBaseUrl(cluster),
    accessToken,
  });

  return config;
}
