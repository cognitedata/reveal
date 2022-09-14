import axios from 'axios';
import { WorkflowSchema } from 'types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';

const { powerOpsApiBaseUrl } = sidecar;

const fetchWorkflowSchemas = async ({
  project,
  token,
}: {
  project: string;
  token: string | undefined;
}): Promise<WorkflowSchema[]> => {
  const { data: workflowSchemas }: { data: WorkflowSchema[] } = await axios.get(
    `${powerOpsApiBaseUrl}/${project}/workflow-schemas`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return workflowSchemas;
};

export const useFetchWorkflowSchemas = ({
  project,
  token,
}: {
  project: string;
  token: string | undefined;
}) => {
  return useQuery({
    queryKey: `workflow_schemas_${project}`,
    queryFn: () => fetchWorkflowSchemas({ project, token }),
  });
};
