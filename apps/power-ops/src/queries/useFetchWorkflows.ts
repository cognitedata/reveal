import { Workflow } from '@cognite/power-ops-api-types';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { axiosRequestConfig } from 'utils/utils';

const { powerOpsApiBaseUrl } = sidecar;

type FetchWorkflowsResponse = {
  workflows: Workflow[];
  nextCursor?: Workflow['id'];
  count: number;
};

const fetchWorkflows = (project: string, token: string) =>
  axios
    .get<FetchWorkflowsResponse>(
      `${powerOpsApiBaseUrl}/${project}/workflows`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchWorkflows = () => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'workflows'],
    queryFn: () => fetchWorkflows(project, token),
    refetchOnWindowFocus: 'always',
  });
};
