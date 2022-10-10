import axios from 'axios';
import { PriceArea } from '@cognite/power-ops-api-types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { axiosRequestConfig } from 'utils/utils';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const fetchPriceAreas = (project: string, token: string) =>
  axios
    .get<PriceArea[]>(
      `${powerOpsApiBaseUrl}/${project}/price-areas`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchPriceAreas = () => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'price-areas'],
    queryFn: () => fetchPriceAreas(project, token),
    staleTime: Infinity,
  });
};
