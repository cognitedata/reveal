import {
  CreateWorkflowDefinitionVariables,
  DeleteWorkflowVariables,
  RunWorkflowVariables,
  CreateWorkflowVariables,
  WorkflowExecution,
  WorkflowResponse,
  WorkflowWithVersions,
  UpdateTaskVariables,
} from '@flows/types/workflows';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';

import { createSession } from './sessions';

const getWorkflowsQueryKey = () => ['flows', 'workflow-list'];

export const useWorkflows = () => {
  const sdk = useSDK();

  return useQuery<WorkflowResponse[]>(getWorkflowsQueryKey(), () =>
    sdk
      .get<{ items: WorkflowResponse[] }>(
        `api/v1/projects/${getProject()}/workflows`
      )
      .then((res) => res.data.items)
  );
};

const getWorkflowQueryKey = (externalId: string) => [
  ...getWorkflowsQueryKey(),
  externalId,
];

export const useWorkflow = (externalId: string) => {
  const sdk = useSDK();

  return useQuery<WorkflowWithVersions>(getWorkflowQueryKey(externalId), () =>
    sdk
      .get<WorkflowWithVersions>(
        `api/v1/projects/${getProject()}/workflows/${externalId}`
      )
      .then((res) => res.data)
  );
};

export const useCreateWorkflow = (
  options?: UseMutationOptions<
    WorkflowResponse,
    unknown,
    CreateWorkflowVariables
  >
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<WorkflowResponse, unknown, CreateWorkflowVariables>(
    (workflow) =>
      sdk
        .post<WorkflowResponse>(`api/v1/projects/${getProject()}/workflows`, {
          data: {
            externalId: workflow.externalId,
            description: workflow.description,
          },
        })
        .then((res) => res.data),
    {
      ...options,
      onSuccess: (...args) => {
        queryClient.invalidateQueries(getWorkflowsQueryKey());
        options?.onSuccess?.(...args);
      },
    }
  );
};

export const useCreateWorkflowDefinition = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<
    WorkflowWithVersions,
    unknown,
    CreateWorkflowDefinitionVariables
  >(
    ({ externalId, version, workflowDefinition }) =>
      sdk
        .post<WorkflowWithVersions>(
          `api/v1/projects/${getProject()}/workflows/${externalId}/versions`,
          {
            data: {
              version,
              workflowDefinition,
            },
          }
        )
        .then((res) => res.data),
    {
      onSuccess: ({ externalId }) => {
        queryClient.invalidateQueries(getWorkflowQueryKey(externalId));
      },
    }
  );
};

export const useWorkflowDefintion = (externalId: string, version: string) => {
  const sdk = useSDK();

  return useQuery<WorkflowWithVersions>(getWorkflowQueryKey(externalId), () =>
    sdk
      .get<WorkflowWithVersions>(
        `api/v1/projects/${getProject()}/workflows/${externalId}/versions/${version}`
      )
      .then((res) => res.data)
  );
};

export const useRunWorkflow = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<WorkflowExecution, unknown, RunWorkflowVariables>(
    async (variables) => {
      const session = await createSession(sdk);

      return sdk
        .post<WorkflowExecution>(
          `api/v1/projects/${getProject()}/workflows/${
            variables.externalId
          }/versions/${variables.version}/run`,
          {
            data: {
              authentication: {
                nonce: session.nonce,
              },
              input: variables?.input,
            },
          }
        )
        .then((res) => res.data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['flows', 'workflow-execution']);
      },
    }
  );
};

const getWorkflowExecutionsQueryKey = (externalId: string) => [
  'flows',
  'workflow-execution',
  'list',
  externalId,
];

export const useWorkflowExecutions = (
  externalId: string,
  options?: UseQueryOptions<WorkflowExecution[]>
) => {
  const sdk = useSDK();

  return useQuery<WorkflowExecution[]>(
    getWorkflowExecutionsQueryKey(externalId),
    () =>
      sdk
        .post<{ items: WorkflowExecution[] }>(
          `api/v1/projects/${getProject()}/workflows/executions/list`,
          {
            data: {
              filter: {
                workflowFilters: [
                  {
                    externalId,
                  },
                ],
              },
            },
          }
        )
        .then((res) => res.data.items),
    options
  );
};

const getWorkflowExecutionDetailsQueryKey = (executionId: string) => [
  'flows',
  'workflow-execution',
  'details',
  executionId,
];

export const useWorkflowExecutionDetails = (
  executionId: string,
  options?: UseQueryOptions<WorkflowExecution>
) => {
  const sdk = useSDK();

  return useQuery<WorkflowExecution>(
    getWorkflowExecutionDetailsQueryKey(executionId),
    () =>
      sdk
        .get<WorkflowExecution>(
          `api/v1/projects/${getProject()}/workflows/executions/${executionId}`
        )
        .then((res) => res.data),
    options
  );
};

export const useDeleteWorkflow = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, DeleteWorkflowVariables>(
    ({ externalId }) =>
      sdk.post(`api/v1/projects/${getProject()}/workflows/delete`, {
        data: [
          {
            externalId,
          },
        ],
      }),
    {
      onSuccess: (_, { externalId }) => {
        queryClient.invalidateQueries(getWorkflowsQueryKey());
        queryClient.invalidateQueries(getWorkflowQueryKey(externalId));
        queryClient.invalidateQueries(
          getWorkflowExecutionsQueryKey(externalId)
        );
      },
    }
  );
};

export const useUpdateTask = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<string, unknown, UpdateTaskVariables>(
    async (variables) => {
      return sdk
        .post(
          `api/v1/projects/${getProject()}/workflows/tasks/${
            variables.taskId
          }/update`,
          {
            data: {
              status: variables.status,
              output: variables?.output,
            },
          }
        )
        .then((res) => res.data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['flows', 'workflow-execution']);
      },
    }
  );
};
