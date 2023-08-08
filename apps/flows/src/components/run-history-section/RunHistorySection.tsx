import styled from 'styled-components';

import { useTranslation } from 'common';
import { BasicPlaceholder } from 'components/basic-placeholder/BasicPlaceholder';
import { StyledEmptyStateContainer } from 'components/run-canvas/RunCanvas';
import { useWorkflowExecutions } from 'hooks/workflows';
import { WorkflowWithVersions } from 'types/workflows';

import { Body, Icon } from '@cognite/cogs.js';

import { RunHistorySectionItem } from './RunHistorySectionItem';

type RunHistorySectionProps = {
  workflow: WorkflowWithVersions;
};

export const RunHistorySection = ({
  workflow,
}: RunHistorySectionProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    data: executions,
    isInitialLoading,
    error,
  } = useWorkflowExecutions(workflow.externalId);

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

  if (error)
    return (
      <BasicPlaceholder
        type="EmptyStateFileSad"
        title={t('error-workflow-execution', { count: 0 })}
      >
        <Body level={5}>{JSON.stringify(error)}</Body>
      </BasicPlaceholder>
    );

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
