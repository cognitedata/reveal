import axios from 'axios';
import { Process } from 'types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const fetchProcesses = async (
  project: string,
  workflowExternalId: string,
  token: string
): Promise<Process[]> => {
  const { data: processes } = await axios.get<Process[]>(
    `${powerOpsApiBaseUrl}/${project}/processesByWorkflowExternalId`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        workflowExternalId,
      },
    }
  );
  return processes;
};

export const useFetchProcesses = (workflowExternalId: string) => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'processes', workflowExternalId],
    queryFn: () => fetchProcesses(project, workflowExternalId, token!),
    enabled: !!token,
  });
};
