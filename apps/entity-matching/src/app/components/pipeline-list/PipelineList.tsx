import { Flex, Icon, Colors } from '@cognite/cogs.js';

import { Pipeline } from '../../hooks/entity-matching-pipelines';

import PipelineListEmpty from './PipelineListEmpty';
import PipelineTable from './PipelineTable';

export type PipelineListProps = {
  isLoading: boolean;
  pipelineList: Pipeline[];
  handleReRunPipeline: (id: number) => void;
  handleDuplicate: (pipeline: Pipeline) => void;
  handleDeletePipeline: (ids: number) => void;
};

export const PipelineList = ({
  isLoading,
  pipelineList,
  handleReRunPipeline,
  handleDuplicate,
  handleDeletePipeline,
}: PipelineListProps) => {
  if (isLoading) {
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
      {pipelineList.length ? (
        <PipelineTable
          dataTestId="pipelines-table"
          pipelineList={pipelineList}
          handleReRunPipeline={handleReRunPipeline}
          handleDuplicate={handleDuplicate}
          handleDeletePipeline={handleDeletePipeline}
        />
      ) : (
        <PipelineListEmpty />
      )}
    </div>
  );
};
