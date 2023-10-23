import { Flex, Icon, Colors } from '@cognite/cogs.js';

import { useEMPipelines } from '../../hooks/entity-matching-pipelines';

import PipelineListEmpty from './PipelineListEmpty';
import PipelineTable, { collectPages } from './PipelineTable';

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

  return (
    <div data-testid="pipelines">
      {collectPages(data!).length ? (
        <PipelineTable dataTestId="pipelines-table" />
      ) : (
        <PipelineListEmpty />
      )}
    </div>
  );
}
