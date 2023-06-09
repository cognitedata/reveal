import { json } from '@codemirror/lang-json';
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
import { useTranslation } from 'common';
import InfoBox from 'components/info-box/InfoBox';
import styled from 'styled-components';
import { useMemo, useState } from 'react';
import { Collapse } from 'antd';
import RunHistoryItem from 'components/run-history-item/RunHistoryItem';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { WorkflowExecution } from 'hooks/workflows';

type RunHistorySectionItemProps = {
  item: WorkflowExecution;
};

export const RunHistorySectionItem = ({
  item,
}: RunHistorySectionItemProps): JSX.Element => {
  const { t } = useTranslation();

  const extensions = useMemo(() => [json()], []);

  const [tabView, setTabView] = useState<string>('definition');

  const [isExpanded, setIsExpanded] = useState(false);

  const { selectedExecution, setSelectedExecution } =
    useWorkflowBuilderContext();

  const isSelected =
    !!selectedExecution?.id && selectedExecution.id === item.id;

  return (
    <StyledCollapse
      $isSelected={isSelected}
      bordered={false}
      expandIcon={({ isActive }) => (
        <Icon type={isActive ? 'ChevronUp' : 'ChevronDown'} />
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
                item.workflowDefinition.tasks,
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
                setSelectedExecution(item);
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
