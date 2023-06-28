import { Flex, Icon, Colors } from '@cognite/cogs.js';

import PipelineListEmpty from './PipelineListEmpty';

import { useEMPipelines } from '@entity-matching-app/hooks/entity-matching-pipelines';

import PipelineTable from './PipelineTable';

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
