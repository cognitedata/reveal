import axios from 'axios';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { axiosRequestConfig } from 'utils/utils';

const { powerOpsApiBaseUrl } = sidecar;

const fetchWorkflowTypes = (project: string, token: string) =>
  axios
    .get<{ workflowType: string }[]>(
      `${powerOpsApiBaseUrl}/${project}/workflow-types`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchWorkflowTypes = () => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'workflow-types'],
    queryFn: () => fetchWorkflowTypes(project, token),
    enabled: Boolean(project && token),
  });
};
