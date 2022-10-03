import axios from 'axios';
import { Process } from 'types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { axiosRequestConfig } from 'utils/utils';

const { powerOpsApiBaseUrl } = sidecar;

const fetchProcesses = (
  project: string,
  workflowExternalId: string,
  token: string
) =>
  axios
    .get<Process[]>(
      `${powerOpsApiBaseUrl}/${project}/processesByWorkflowExternalId`,
      axiosRequestConfig(token, { params: { workflowExternalId } })
    )
    .then(({ data }) => data);

export const useFetchProcesses = (workflowExternalId: string) => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'processes', workflowExternalId],
    queryFn: () => fetchProcesses(project, workflowExternalId, token),
    enabled: Boolean(project && token),
  });
};
