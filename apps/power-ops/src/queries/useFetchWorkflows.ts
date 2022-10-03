import { Workflow } from 'types';
import axios from 'axios';
import { useQuery } from 'react-query';
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
    .then(({ data }) => data.workflows);

export const useFetchWorkflows = () => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'workflows'],
    queryFn: () => fetchWorkflows(project, token),
    enabled: Boolean(project && token),
  });
};
