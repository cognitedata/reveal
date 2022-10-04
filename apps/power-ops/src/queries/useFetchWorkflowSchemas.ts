import axios from 'axios';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { axiosRequestConfig } from 'utils/utils';
import { FetchWorkflowSchemasResponse } from '@cognite/power-ops-api-types';

const { powerOpsApiBaseUrl } = sidecar;

const fetchWorkflowSchemas = (project: string, token: string) =>
  axios
    .get<FetchWorkflowSchemasResponse>(
      `${powerOpsApiBaseUrl}/${project}/workflow-schemas`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchWorkflowSchemas = () => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'workflow-schemas'],
    queryFn: () => fetchWorkflowSchemas(project, token),
    enabled: Boolean(project && token),
  });
};
