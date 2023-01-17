import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { axiosRequestConfig } from 'utils/utils';
import sidecar from 'utils/sidecar';
import { RkomConfig } from '@cognite/power-ops-api-types';

const { powerOpsApiBaseUrl } = sidecar;

const fetchRKOMConfig = (project: string, token: string) =>
  axios
    .get<RkomConfig>(
      `${powerOpsApiBaseUrl}/${project}/rkom-config`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchRKOMConfig = () => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'rkomConfig'],
    queryFn: () => fetchRKOMConfig(project, token),
  });
};
