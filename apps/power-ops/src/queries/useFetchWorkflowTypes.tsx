import axios from 'axios';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';

const { powerOpsApiBaseUrl } = sidecar;

const fetchWorkflowTypes = async ({
  project,
  token,
}: {
  project: string;
  token: string | undefined;
}) => {
  const { data: workflowTypes }: { data: { workflowType: string }[] } =
    await axios.get(`${powerOpsApiBaseUrl}/${project}/workflow-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  return workflowTypes;
};

export const useFetchWorkflowTypes = ({
  project,
  token,
}: {
  project: string;
  token: string | undefined;
}) => {
  return useQuery({
    queryKey: `workflow_types_${project}`,
    queryFn: () => fetchWorkflowTypes({ project, token }),
  });
};
