import { Items } from '@flows/types';
import {
  VersionCreate,
  DeleteWorkflowVariables,
  RunWorkflowVariables,
  CreateWorkflowVariables,
  WorkflowExecution,
  WorkflowResponse,
  WorkflowWithVersions,
  VersionResponse,
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

  return useQuery<WorkflowWithVersions>(
    getWorkflowQueryKey(externalId),
    async () => {
      const [workflowRes, versionsRes] = await Promise.all([
        sdk.get<WorkflowResponse>(
          `api/v1/projects/${getProject()}/workflows/${externalId}`
        ),
        sdk.post<Items<VersionResponse>>(
          `api/v1/projects/${getProject()}/workflows/versions/list`,
          {
            data: {
              filter: {
                workflowFilters: [
                  {
                    externalId: externalId,
                  },
                ],
              },
            },
          }
        ),
      ]);

      const versions = versionsRes.data.items;
      const versionMap = versions.reduce((acc, version) => {
        acc[version.version] = version.workflowDefinition;
        return acc;
      }, {});

      const workflowWithVersions: WorkflowWithVersions = {
        externalId: workflowRes.data.externalId,
        createdTime: workflowRes.data.createdTime,
        versions: versionMap,
      };

      return workflowWithVersions;
    }
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
        .post<Items<WorkflowResponse>>(
          `api/v1/projects/${getProject()}/workflows`,
          {
            data: {
              items: [workflow],
            },
          }
        )
        .then((res) => res.data.items[0]),
    {
      ...options,
      onSuccess: (...args) => {
        queryClient.invalidateQueries(getWorkflowsQueryKey());
        options?.onSuccess?.(...args);
      },
    }
  );
};

export const useCreateVersion = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<VersionResponse, unknown, VersionCreate>(
    (versionToCreate) =>
      sdk
        .post<Items<VersionResponse>>(
          `api/v1/projects/${getProject()}/workflows/versions`,
          {
            data: {
              items: [versionToCreate],
            },
          }
        )
        .then((res) => res.data.items[0]),
    {
      onSuccess: ({ workflowExternalId }) => {
        queryClient.invalidateQueries(getWorkflowQueryKey(workflowExternalId));
      },
    }
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
    (workflowDelete) =>
      sdk.post(`api/v1/projects/${getProject()}/workflows/delete`, {
        data: {
          items: [workflowDelete],
        },
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
