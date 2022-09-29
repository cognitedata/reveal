import axios from 'axios';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { snifferServiceBaseUrl } = sidecar;

const fetchJobs = async (project: string, token: string) => {
  return axios
    .get(`${snifferServiceBaseUrl}/${project}/jobs/list-all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.data);
};

export const useFetchSnifferJobs = () => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'sniffer-jobs'],
    queryFn: () => fetchJobs(project, token!),
    enabled: !!token,
    // refetchInterval: 5000,
  });
};
