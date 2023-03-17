import { Flex, Icon, Colors } from '@cognite/cogs.js';
import { useEMPipelines } from 'hooks/contextualization-api';
import PipelineTable from './PipelineTable';
import PipelineListEmpty from './PipelineListEmpty';

export default function PipelineList() {
  const { data, isInitialLoading } = useEMPipelines();

  if (isInitialLoading) {
    return (
      <Flex justifyContent="space-around" style={{ marginTop: 150 }}>
        <Icon
          size={32}
          type="Loader"
          css={{ color: Colors['text-icon--muted'] }}
        />
      </Flex>
    );
  }

  return <>{data?.length ? <PipelineTable /> : <PipelineListEmpty />}</>;
}
