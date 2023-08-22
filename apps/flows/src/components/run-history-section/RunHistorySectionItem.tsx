import { useMemo, useState } from 'react';

import styled from 'styled-components';

import { json } from '@codemirror/lang-json';
import { useTranslation } from '@flows/common';
import { BasicPlaceholder } from '@flows/components/basic-placeholder/BasicPlaceholder';
import InfoBox from '@flows/components/info-box/InfoBox';
import RunHistoryItem from '@flows/components/run-history-item/RunHistoryItem';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';
import { useWorkflowExecutionDetails } from '@flows/hooks/workflows';
import { WorkflowExecution } from '@flows/types/workflows';
import { Collapse } from 'antd';

import { CodeSnippet, Timestamp } from '@cognite/cdf-utilities';
import {
  Body,
  Button,
  Colors,
  Elevations,
  Flex,
  Icon,
  Overline,
} from '@cognite/cogs.js';

type RunHistorySectionItemProps = {
  item: WorkflowExecution;
};

export const RunHistorySectionItem = ({
  item,
}: RunHistorySectionItemProps): JSX.Element => {
  const { t } = useTranslation();

  const extensions = useMemo(() => [json()], []);

  const [tabView, setTabView] = useState<string>('results');

  const [isExpanded, setIsExpanded] = useState(false);

  const { selectedExecution, setSelectedExecution } =
    useWorkflowBuilderContext();

  const isSelected =
    !!selectedExecution?.id && selectedExecution.id === item.id;

  const {
    data: execution,
    isInitialLoading,
    error,
  } = useWorkflowExecutionDetails(item?.id ?? '', {
    enabled: !!item?.id,
  });

  if (isInitialLoading)
    return <Icon aria-label="Loading execution details" type="Loader" />;

  if (error)
    return (
      <BasicPlaceholder
        type="EmptyStateFileSad"
        title={t('error-workflow-execution', { count: 1 })}
      >
        <Body level={5}>{JSON.stringify(error)}</Body>
      </BasicPlaceholder>
    );

  return (
    <StyledCollapse
      $isSelected={isSelected}
      bordered={false}
      expandIcon={({ isActive }) => (
        <Icon
          aria-label="Interact with the execution details"
          type={isActive ? 'ChevronUp' : 'ChevronDown'}
        />
      )}
      expandIconPosition="right"
      onChange={() => {
        setIsExpanded((prevState) => !prevState);
      }}
    >
      <Collapse.Panel
        key="run-history-panel"
        header={
          <RunHistoryItem
            isExpanded={isExpanded}
            tabView={tabView}
            updateTabView={(view) => setTabView(view)}
            execution={item}
          />
        }
      >
        {tabView === 'sql' ? (
          <div>
            <CodeSnippet
              extensions={extensions}
              value={JSON.stringify(
                execution?.workflowDefinition?.tasks,
                undefined,
                2
              )}
            />
          </div>
        ) : (
          <Flex direction="column" gap={12}>
            {item.reasonForIncompletion && (
              <InfoBox status="critical">{item.reasonForIncompletion}</InfoBox>
            )}
            <StyledDetailsGrid>
              <FieldContainer>
                <Overline level={3} muted>
                  {t('id')}
                </Overline>
                <Body level={3}>{item.id}</Body>
              </FieldContainer>
              <FieldContainer>
                <Overline level={3} muted>
                  {t('created-at')}
                </Overline>
                <Body level={3}>
                  <Timestamp absolute timestamp={item.createdTime} />
                </Body>
              </FieldContainer>
              <FieldContainer>
                <Overline level={3} muted>
                  {t('started-at')}
                </Overline>
                <Body level={3}>
                  <Timestamp absolute timestamp={item.startTime} />
                </Body>
              </FieldContainer>
              <FieldContainer>
                <Overline level={3} muted>
                  {t('finished-at')}
                </Overline>
                <Body level={3}>
                  <Timestamp absolute timestamp={item.endTime} />
                </Body>
              </FieldContainer>
            </StyledDetailsGrid>
            <Button
              disabled={isSelected}
              onClick={() => {
                setSelectedExecution(execution);
              }}
            >
              {isSelected ? t('run-is-selected') : t('view-run')}
            </Button>
          </Flex>
        )}
      </Collapse.Panel>
    </StyledCollapse>
  );
};

const StyledDetailsGrid = styled.div`
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  display: grid;
  gap: 12px 24px;
  grid-template-columns: repeat(auto-fit, minmax(200px, max-content));
  padding: 12px;
`;

const StyledCollapse = styled(Collapse)<{ $isSelected?: boolean }>`
  border: 1px solid ${Colors['border--interactive--disabled']};
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  background-color: ${({ $isSelected }) =>
    $isSelected ? Colors['surface--status-neutral--muted--default--alt'] : ''};
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
