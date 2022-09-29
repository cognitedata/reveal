import axios from 'axios';
import { WorkflowSchema } from 'types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const fetchWorkflowSchemas = async (
  project: string,
  token: string
): Promise<WorkflowSchema[]> => {
  const { data: workflowSchemas }: { data: WorkflowSchema[] } = await axios.get(
    `${powerOpsApiBaseUrl}/${project}/workflow-schemas`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return workflowSchemas;
};

export const useFetchWorkflowSchemas = () => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'workflow-schemas'],
    queryFn: () => fetchWorkflowSchemas(project, token!),
    enabled: !!token,
  });
};
