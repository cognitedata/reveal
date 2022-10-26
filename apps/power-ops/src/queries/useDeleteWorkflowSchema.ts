import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import sidecar from 'utils/sidecar';
import {
  FetchWorkflowSchemasResponse,
  WorkflowSchemaWithProcesses,
} from '@cognite/power-ops-api-types';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const deleteWorkflowSchemaBackend = (
  workflowSchema: WorkflowSchemaWithProcesses,
  token: string
) =>
  axios
    .delete<WorkflowSchemaWithProcesses>(
      `${powerOpsApiBaseUrl}/${workflowSchema.cdfProject}/workflow-schemas/${workflowSchema.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(({ data }) => data);

const updateWorkflowSchemas = (
  oldWorkflowSchemas: FetchWorkflowSchemasResponse,
  deletedWorkflowSchema: WorkflowSchemaWithProcesses
): FetchWorkflowSchemasResponse => {
  return {
    workflowSchemas: oldWorkflowSchemas.workflowSchemas.filter(
      (oldWorkflowSchema) => oldWorkflowSchema.id !== deletedWorkflowSchema.id
    ),
    count: oldWorkflowSchemas.count === 0 ? 0 : oldWorkflowSchemas.count - 1,
  };
};

export const useDeleteWorkflowSchema = () => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  const queryClient = useQueryClient();
  const workflowSchemasKey = [project, 'workflow-schemas'];

  return useMutation({
    mutationFn: (workflowSchema: WorkflowSchemaWithProcesses) =>
      deleteWorkflowSchemaBackend(workflowSchema, token!),
    onMutate: async (deletedWorkflowSchema) => {
      // Stop any data refresh
      await queryClient.cancelQueries(workflowSchemasKey);
      // Get a snapshot of the previous value in case of failure
      const previousWorkflowSchemas =
        queryClient.getQueryData(workflowSchemasKey);
      // Optimistically update the state with the new value
      queryClient.setQueryData<FetchWorkflowSchemasResponse>(
        workflowSchemasKey,
        (oldWorkflowSchemas = { workflowSchemas: [], count: 0 }) =>
          updateWorkflowSchemas(oldWorkflowSchemas, deletedWorkflowSchema)
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
