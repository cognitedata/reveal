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
