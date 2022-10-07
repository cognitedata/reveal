import axios from 'axios';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { SnifferErrorLog } from '@cognite/sniffer-service-types';
import { axiosRequestConfig } from 'utils/utils';

const { snifferServiceBaseUrl } = sidecar;

const fetchJobErrors = (project: string, token: string, jobName: string) =>
  axios
    .get<SnifferErrorLog[]>(
      `${snifferServiceBaseUrl}/${project}/jobs/job-errors`,
      axiosRequestConfig(token, { params: { jobName } })
    )
    .then(({ data }) => data);

export const useFetchSnifferJobErrors = (jobName: string) => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'sniffer-errors', jobName],
    queryFn: () => fetchJobErrors(project, token, jobName),
    enabled: !!jobName,
  });
};
