import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
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

type WorkflowTaskDefinition = {
  externalId: string;
  type: WorkflowTaskType;
  name?: string;
  description?: string;
  parameters: unknown; // TODO
  retries?: number;
  timeout?: number;
  dependsOn: WorkflowTaskDependency[];
};

type WorkflowDefinition = {
  hash: string;
  description?: string;
  version: string;
  tasks: WorkflowTaskDefinition[];
};

type WorkflowWithVersions = Pick<WorkflowRead, 'externalId' | 'createdTime'> & {
  versions: WorkflowDefinition[];
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
