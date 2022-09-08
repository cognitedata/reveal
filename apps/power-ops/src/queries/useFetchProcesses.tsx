import axios from 'axios';
import { Process } from 'types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';

const { powerOpsApiBaseUrl } = sidecar;

const fetchProcesses = async ({
  project,
  workflowExternalId,
  token,
}: {
  project: string;
  workflowExternalId: string;
  token: string | undefined;
}): Promise<Process[]> => {
  const { data: processes }: { data: Process[] } = await axios.get(
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

export const useFetchProcesses = ({
  project,
  workflowExternalId,
  token,
}: {
  project: string;
  workflowExternalId: string;
  token: string | undefined;
}) => {
  return useQuery({
    queryKey: `processes_${workflowExternalId}`,
    queryFn: () => fetchProcesses({ project, workflowExternalId, token }),
  });
};
