import { CogniteClient } from '@cognite/sdk';
import axios from 'axios';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';

const { snifferServiceBaseUrl } = sidecar;

const fetchJobs = ({
  client,
  token,
}: {
  client: CogniteClient;
  token: string;
}) => {
  return axios
    .get(`${snifferServiceBaseUrl}/${client.project}/jobs/list-all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.data);
};

export const useFetchSnifferJobs = ({
  client,
  token,
}: {
  client: CogniteClient;
  token: string;
}) => {
  return useQuery({
    queryKey: `sniffer-jobs-${client.project}`,
    queryFn: () => fetchJobs({ client, token }),
    // refetchInterval: 5000,
  });
};
