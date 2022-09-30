import { Workflow } from 'types';
import axios from 'axios';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

type FetchWorkflowsResponse = {
  workflows: Workflow[];
  nextCursor?: Workflow['id'];
  count: number;
};

const fetchWorkflows = async (
  project: string,
  token: string
): Promise<Workflow[]> =>
  axios
    .get<FetchWorkflowsResponse>(`${powerOpsApiBaseUrl}/${project}/workflows`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.data.workflows);

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
