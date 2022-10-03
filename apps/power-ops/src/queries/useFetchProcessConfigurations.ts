import { useQuery } from 'react-query';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import axios from 'axios';
import { BidProcessConfiguration } from '@cognite/power-ops-api-types';
import { axiosRequestConfig } from 'utils/utils';

const { powerOpsApiBaseUrl } = sidecar;

const fetchProcessConfigurations = (
  project: string,
  token: string,
  priceArea: string
) =>
  axios
    .get<BidProcessConfiguration[]>(
      `${powerOpsApiBaseUrl}/${project}/price-area/${priceArea}/process-configurations`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchProcessConfigurations = (priceArea: string) => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'process-configurations', priceArea],
    queryFn: () => fetchProcessConfigurations(project, token, priceArea),
    enabled: !!priceArea,
    staleTime: Infinity,
  });
};
