import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { SnifferJob } from '@cognite/sniffer-service-types';
import { axiosRequestConfig } from 'utils/utils';

const { snifferServiceBaseUrl } = sidecar;

const fetchJobs = (project: string, token: string) =>
  axios
    .get<SnifferJob[]>(
      `${snifferServiceBaseUrl}/${project}/jobs/list-all`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchSnifferJobs = () => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'sniffer-jobs'],
    queryFn: () => fetchJobs(project, token),
  });
};
