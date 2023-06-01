import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';

const getWorkflowsQueryKey = () => ['flows', 'workflow-list'];

export type WorkflowRead = {
  externalId: string;
  description?: string;
  createdTime: string;
};

export const useWorkflows = () => {
  const sdk = useSDK();

  return useQuery<WorkflowRead[]>(getWorkflowsQueryKey(), () =>
    sdk
      .get<{ items: WorkflowRead[] }>(
        `api/v1/projects/${getProject()}/workflows`,
        {
          headers: {
            'cdf-version': 'alpha',
          },
        }
      )
      .then((res) => res.data.items)
  );
};
