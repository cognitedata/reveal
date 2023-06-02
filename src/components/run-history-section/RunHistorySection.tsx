import { Colors, Elevations, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

import { WorkflowWithVersions, useWorkflowExecutions } from 'hooks/workflows';
import { Collapse } from 'antd';
import RunHistoryItem from 'components/run-history-item/RunHistoryItem';
import { useState } from 'react';

type RunHistorySectionProps = {
  workflow: WorkflowWithVersions;
};

export const RunHistorySection = ({
  workflow,
}: RunHistorySectionProps): JSX.Element => {
  const { data: executions } = useWorkflowExecutions(workflow.externalId);

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

  return (
    <Container>
      {executions?.map((item) => {
        const { id = '' } = item;
        return (
          <div key={id} id={id}>
            <StyledCollapse
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
                  />
                }
              >
                content
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
  gap: 12px;
`;

const StyledCollapse = styled(Collapse)`
  border: 1px solid ${Colors['border--interactive--disabled']};
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
`;
