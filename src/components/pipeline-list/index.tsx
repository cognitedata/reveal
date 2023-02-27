import { Icon } from '@cognite/cogs.js';
import { useEMPipelines } from 'hooks/contextualization-api';
import PipelineTable from './PipelineTable';

export default function PipelineList() {
  const { data, isInitialLoading } = useEMPipelines();

  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }

  return <>{data?.length && <PipelineTable />}</>;
}
