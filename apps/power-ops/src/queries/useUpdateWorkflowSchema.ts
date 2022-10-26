import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import sidecar from 'utils/sidecar';
import {
  FetchWorkflowSchemasResponse,
  WorkflowSchemaWithProcesses,
  WorkflowSchemaWithProcessesUpdate,
} from '@cognite/power-ops-api-types';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const updateWorkflowSchemaBackend = (
  workflowSchema: WorkflowSchemaWithProcessesUpdate,
  token: string
) =>
  axios
    .put<WorkflowSchemaWithProcesses>(
      `${powerOpsApiBaseUrl}/${workflowSchema.cdfProject}/workflow-schemas/${workflowSchema.id}`,
      workflowSchema,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(({ data }) => data);

const updateWorkflowSchemas = (
  oldWorkflowSchemas: FetchWorkflowSchemasResponse,
  newWorkflowSchema: WorkflowSchemaWithProcessesUpdate
): FetchWorkflowSchemasResponse => {
  return {
    workflowSchemas: oldWorkflowSchemas.workflowSchemas.map(
      (oldWorkflowSchema) =>
        oldWorkflowSchema.id === newWorkflowSchema.id
          ? { ...oldWorkflowSchema, ...newWorkflowSchema }
          : oldWorkflowSchema
    ),
    count: oldWorkflowSchemas.count,
  };
};

export const useUpdateWorkflowSchema = () => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  const queryClient = useQueryClient();
  const workflowSchemasKey = [project, 'workflow-schemas'];

  return useMutation({
    mutationFn: (workflowSchema: WorkflowSchemaWithProcessesUpdate) =>
      updateWorkflowSchemaBackend(workflowSchema, token!),
    onMutate: async (newWorkflowSchema) => {
      // Stop any data refresh
      await queryClient.cancelQueries(workflowSchemasKey);
      // Get a snapshot of the previous value in case of failure
      const previousWorkflowSchemas =
        queryClient.getQueryData(workflowSchemasKey);
      // Optimistically update the state with the new value
      queryClient.setQueryData<FetchWorkflowSchemasResponse>(
        workflowSchemasKey,
        (oldWorkflowSchemas = { workflowSchemas: [], count: 0 }) =>
          updateWorkflowSchemas(oldWorkflowSchemas, newWorkflowSchema)
      );
      return previousWorkflowSchemas;
    },
    onError: (_, _1, previousWorkflowSchemas) => {
      // If the mutation fails, restore previous values to keep UI consistent
      queryClient.setQueryData(workflowSchemasKey, previousWorkflowSchemas);
    },
    onSettled: () => {
      // When the mutation finishes, rehydrate the data to get the updated values
      queryClient.invalidateQueries(workflowSchemasKey);
    },
  });
};
