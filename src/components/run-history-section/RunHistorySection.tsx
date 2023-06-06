import {
  Body,
  Button,
  Colors,
  Elevations,
  Flex,
  Icon,
  Overline,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import { WorkflowWithVersions, useWorkflowExecutions } from 'hooks/workflows';
import { Collapse } from 'antd';
import RunHistoryItem from 'components/run-history-item/RunHistoryItem';
import { useMemo, useState } from 'react';
import { CodeSnippet, Timestamp } from '@cognite/cdf-utilities';
import { json } from '@codemirror/lang-json';
import { useTranslation } from 'common';
import InfoBox from 'components/info-box/InfoBox';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { StyledEmptyStateContainer } from 'components/run-canvas/RunCanvas';

type RunHistorySectionProps = {
  workflow: WorkflowWithVersions;
};

export const RunHistorySection = ({
  workflow,
}: RunHistorySectionProps): JSX.Element => {
  const { t } = useTranslation();

  const { selectedExecution, setSelectedExecution } =
    useWorkflowBuilderContext();

  const { data: executions, isInitialLoading } = useWorkflowExecutions(
    workflow.externalId,
    {
      refetchInterval: 5000,
    }
  );

  const [expandedRunHistoryCards, setExpandedRunHistoryCards] = useState<
    string[]
  >([]);

  const [tabViews, setTabViews] = useState<Record<string, string>>({});

  const expandRunHistoryCard = (id: string) => {
    setExpandedRunHistoryCards((prevState) => prevState.concat(id));
  };

  const collapseRunHistoryCard = (id: string) => {
    setExpandedRunHistoryCards((prevState) =>
      prevState.filter((currentId) => currentId !== id)
    );
  };

  const handleUpdateTabView = (id: string, view: string) => {
    setTabViews((prevState) => {
      const nextState = { ...prevState };
      nextState[id] = view;
      return nextState;
    });
  };

  const extensions = useMemo(() => [json()], []);

  if (isInitialLoading) {
    return (
      <StyledEmptyStateContainer>
        <Icon type="Loader" />
      </StyledEmptyStateContainer>
    );
  }

  return (
    <Container>
      {executions?.map((item) => {
        const { id = '' } = item;
        const isSelected =
          !!selectedExecution?.id && selectedExecution.id === item.id;
        return (
          <div key={id} id={id}>
            <StyledCollapse
              $isSelected={isSelected}
              bordered={false}
              expandIcon={({ isActive }) => (
                <Icon type={isActive ? 'ChevronUp' : 'ChevronDown'} />
              )}
              expandIconPosition="right"
              key={id}
              onChange={(key) => {
                const isExpanded = typeof key === 'string' || key.length > 0;
                if (isExpanded) {
                  expandRunHistoryCard(id);
                } else {
                  collapseRunHistoryCard(id);
                }
              }}
            >
              <Collapse.Panel
                key={id}
                header={
                  <RunHistoryItem
                    isExpanded={expandedRunHistoryCards.includes(id)}
                    tabView={tabViews[id]}
                    updateTabView={(view) => handleUpdateTabView(id, view)}
                    execution={item}
                  />
                }
              >
                {tabViews[id] === 'sql' ? (
                  <div>
                    <CodeSnippet
                      extensions={extensions}
                      value={JSON.stringify(
                        item.workflowDefinition.tasks,
                        undefined,
                        2
                      )}
                    />
                  </div>
                ) : (
                  <Flex direction="column" gap={12}>
                    <InfoBox status="critical">
                      {item.reasonForIncompletion || t('no-error-details')}
                    </InfoBox>
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
                        setSelectedExecution(item);
                      }}
                    >
                      {isSelected ? t('run-is-selected') : t('view-run')}
                    </Button>
                  </Flex>
                )}
              </Collapse.Panel>
            </StyledCollapse>
          </div>
        );
      })}
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

const StyledCollapse = styled(Collapse)<{ $isSelected?: boolean }>`
  border: 1px solid ${Colors['border--interactive--disabled']};
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  background-color: ${({ $isSelected }) =>
    $isSelected ? Colors['surface--status-neutral--muted--default--alt'] : ''};
`;

const StyledDetailsGrid = styled.div`
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  display: grid;
  gap: 12px 24px;
  grid-template-columns: repeat(auto-fit, minmax(200px, max-content));
  padding: 12px;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
