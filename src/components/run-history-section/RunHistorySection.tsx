import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useWorkflowExecutions } from 'hooks/workflows';
import { StyledEmptyStateContainer } from 'components/run-canvas/RunCanvas';
import { RunHistorySectionItem } from './RunHistorySectionItem';
import { WorkflowWithVersions } from 'types/workflows';

type RunHistorySectionProps = {
  workflow: WorkflowWithVersions;
};

export const RunHistorySection = ({
  workflow,
}: RunHistorySectionProps): JSX.Element => {
  const { data: executions, isInitialLoading } = useWorkflowExecutions(
    workflow.externalId
  );

  useWorkflowExecutions(workflow.externalId, {
    refetchInterval: executions?.some(({ endTime }) => !endTime)
      ? 3000
      : undefined,
  });

  if (isInitialLoading) {
    return (
      <StyledEmptyStateContainer>
        <Icon type="Loader" />
      </StyledEmptyStateContainer>
    );
  }

  return (
    <Container>
      {executions?.map((item) => (
        <RunHistorySectionItem key={item.id ?? ''} item={item} />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
  overflow-y: auto;
`;
