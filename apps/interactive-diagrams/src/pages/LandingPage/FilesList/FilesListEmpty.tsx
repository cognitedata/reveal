import React from 'react';

import styled from 'styled-components';

import { Button, Illustrations, Title } from '@cognite/cogs.js';

import { useWorkflowCreateNew } from '../../../modules/workflows';
import { PNID_METRICS, trackUsage } from '../../../utils/Metrics';

const Wrapper = styled.div`
  width: 100%;
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default function FilesListEmpty() {
  const { createWorkflow } = useWorkflowCreateNew();

  const onContextualizeNew = () => {
    trackUsage(PNID_METRICS.landingPage.startNew);
    createWorkflow();
  };

  return (
    <div>
      <Title level={4}>Pending interactive diagrams</Title>
      <Wrapper>
        <Illustrations.Solo type="PAndIdDiagram" />
        <Title level={5} style={{ margin: '24px 0' }}>
          No pending interactive diagrams to review!
        </Title>
        <Button
          aria-label="Create new interactive diagrams"
          type="primary"
          icon="Document"
          onClick={onContextualizeNew}
          data-cy="create-new-interactive-diagrams-button"
        >
          Create new interactive diagrams
        </Button>
      </Wrapper>
    </div>
  );
}
