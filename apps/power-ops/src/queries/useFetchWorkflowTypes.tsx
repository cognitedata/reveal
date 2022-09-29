import axios from 'axios';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const fetchWorkflowTypes = async (project: string, token: string) => {
  const { data: workflowTypes }: { data: { workflowType: string }[] } =
    await axios.get(`${powerOpsApiBaseUrl}/${project}/workflow-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  return workflowTypes;
};

export const useFetchWorkflowTypes = () => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'workflow-types'],
    queryFn: () => fetchWorkflowTypes(project, token!),
    enabled: !!token,
  });
};
