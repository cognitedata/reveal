import { Flex, Icon, Colors } from '@cognite/cogs.js';

import PipelineTable from './PipelineTable';
import PipelineListEmpty from './PipelineListEmpty';
import { useEMPipelines } from 'hooks/entity-matching-pipelines';

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
