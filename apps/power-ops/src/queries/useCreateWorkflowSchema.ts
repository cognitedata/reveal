import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import sidecar from 'utils/sidecar';
import {
  FetchWorkflowSchemasResponse,
  WorkflowSchemaWithProcesses,
  WorkflowSchemaWithProcessesCreate,
} from '@cognite/power-ops-api-types';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const createWorkflowSchemaBackend = (
  workflowSchema: WorkflowSchemaWithProcessesCreate,
  project: string,
  token: string
) =>
  axios
    .post<WorkflowSchemaWithProcesses>(
      `${powerOpsApiBaseUrl}/${project}/workflow-schemas`,
      workflowSchema,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(({ data }) => data);

const updateWorkflowSchemas = (
  oldWorkflowSchemas: FetchWorkflowSchemasResponse,
  createdWorkflowSchema: WorkflowSchemaWithProcesses
): FetchWorkflowSchemasResponse => {
  return {
    workflowSchemas: [
      createdWorkflowSchema,
      ...oldWorkflowSchemas.workflowSchemas,
    ],
    count: oldWorkflowSchemas.count + 1,
  };
};

export const useCreateWorkflowSchema = () => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  const queryClient = useQueryClient();
  const workflowSchemasKey = [project, 'workflow-schemas'];
  const emptyWorkflowSchema: WorkflowSchemaWithProcessesCreate = {
    name: 'Untitled',
    cdfProject: project,
    triggeredBy: ['<CHANGE_HERE>'],
    workflowType: 'UNTITLED',
    processes: [],
  };

  return useMutation({
    mutationFn: () =>
      createWorkflowSchemaBackend(emptyWorkflowSchema, project, token!),
    onMutate: async () => {
      // Stop any data refresh
      await queryClient.cancelQueries(workflowSchemasKey);
      // Get a snapshot of the previous value in case of failure
      const previousWorkflowSchemas =
        queryClient.getQueryData(workflowSchemasKey);
      // Optimistically update the state with the new value
      queryClient.setQueryData<FetchWorkflowSchemasResponse>(
        workflowSchemasKey,
        (oldWorkflowSchemas = { workflowSchemas: [], count: 0 }) =>
          updateWorkflowSchemas(oldWorkflowSchemas, {
            ...emptyWorkflowSchema,
            id: NaN,
          })
      );
      return previousWorkflowSchemas;
    },
    onError: (_, _1, previousWorkflowSchemas) => {
      // If the mutation fails, restore previous values to keep UI consistent
      queryClient.setQueryData(workflowSchemasKey, previousWorkflowSchemas);
    },
    onSettled: () => {
      // When the mutation finishes, rehydrate the data to get the most recent values
      queryClient.invalidateQueries(workflowSchemasKey);
    },
  });
};
