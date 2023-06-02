import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const getWorkflowsQueryKey = () => ['flows', 'workflow-list'];

export type WorkflowRead = {
  externalId: string;
  description?: string;
  createdTime: string;
};

type WorkflowCreate = Pick<WorkflowRead, 'externalId' | 'description'>;

export const useWorkflows = () => {
  const sdk = useSDK();

  return useQuery<WorkflowRead[]>(getWorkflowsQueryKey(), () =>
    sdk
      .get<{ items: WorkflowRead[] }>(
        `api/v1/projects/${getProject()}/workflows`
      )
      .then((res) => res.data.items)
  );
};

const getWorkflowQueryKey = (externalId: string) => [
  ...getWorkflowsQueryKey(),
  externalId,
];

type WorkflowTaskType = 'function' | 'transformation' | 'http' | 'dynamic';

type WorkflowTaskDependency = {
  externalId: string;
};

type FunctionParameters = {
  function: {
    externalId: string;
    data?: unknown;
  };
};

type TransformationParameters = {
  transformation: {
    externalId: string;
  };
};

type WorkflowTaskParameters = TransformationParameters | FunctionParameters;

export type WorkflowTaskDefinition = {
  externalId: string;
  type: WorkflowTaskType;
  name?: string;
  description?: string;
  parameters: WorkflowTaskParameters;
  retries?: number;
  timeout?: number;
  dependsOn: WorkflowTaskDependency[];
};

export type WorkflowDefinitionRead = {
  hash: string;
  description?: string;
  version: string;
  tasks: WorkflowTaskDefinition[];
};

export type WorkflowDefinitionCreate = Pick<
  WorkflowDefinitionRead,
  'description' | 'tasks'
>;

export type WorkflowWithVersions = Pick<
  WorkflowRead,
  'externalId' | 'createdTime'
> & {
  versions: { [version: string]: WorkflowDefinitionRead };
};

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

type CreateWorkflowVariables = WorkflowCreate;

export const useCreateWorkflow = (
  options?: UseMutationOptions<WorkflowRead, unknown, CreateWorkflowVariables>
) => {
  const sdk = useSDK();

  return useMutation<WorkflowRead, unknown, CreateWorkflowVariables>(
    (workflow) =>
      sdk
        .post<WorkflowRead>(`api/v1/projects/${getProject()}/workflows`, {
          data: {
            externalId: workflow.externalId,
            description: workflow.description,
          },
        })
        .then((res) => res.data),
    options
  );
};

type CreateWorkflowDefinitionVariables = {
  externalId: string;
  version: string;
  workflowDefinition: WorkflowDefinitionCreate;
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
