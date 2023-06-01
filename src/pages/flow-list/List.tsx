import { Icon } from '@cognite/cogs.js';

import { useWorkflows } from 'hooks/workflows';
import WorkflowTable from 'components/workflow-table/WorkflowTable';

export default function List() {
  const {
    data: workflows,
    error,
    isInitialLoading: isInitialLoadingWorkflows,
  } = useWorkflows();

  if (isInitialLoadingWorkflows || !workflows) {
    return <Icon type="Loader" />;
  }

  if (error) {
    return (
      <div>
        <p>Error</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return <WorkflowTable workflows={workflows} />;
}
