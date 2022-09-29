import axios from 'axios';
import { Workflow } from 'types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const fetchWorkflows = async (
  project: string,
  token: string
): Promise<Workflow[]> => {
  const { data: workflows }: { data: Workflow[] } = await axios.get(
    `${powerOpsApiBaseUrl}/${project}/workflows`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return workflows;
};

export const useFetchWorkflows = () => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'workflows'],
    queryFn: () => fetchWorkflows(project, token!),
    enabled: !!token,
  });
};
