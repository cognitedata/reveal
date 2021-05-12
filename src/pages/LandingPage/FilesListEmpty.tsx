import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Graphic, Title } from '@cognite/cogs.js';
import { IconButton } from 'components/Common';
import { createNewWorkflow } from 'modules/workflows';
import { diagramSelection } from 'routes/paths';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';

const Wrapper = styled.div`
  width: 100%;
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default function FilesListEmpty() {
  const { tenant } = useParams<{ tenant: string }>();
  const history = useHistory();
  const dispatch = useDispatch();

  const onContextualizeNew = () => {
    trackUsage(PNID_METRICS.contextualization.start);
    const newWorkflowId = Number(new Date());
    dispatch(createNewWorkflow(newWorkflowId));
    history.push(diagramSelection.path(tenant, String(newWorkflowId)));
  };

  return (
    <Wrapper>
      <Graphic type="Documents" />
      <Title level={5} style={{ margin: '24px 0' }}>
        No files have been contextualized yet!
      </Title>
      <IconButton type="primary" icon="Document" onClick={onContextualizeNew}>
        Contextualize a new file
      </IconButton>
    </Wrapper>
  );
}
