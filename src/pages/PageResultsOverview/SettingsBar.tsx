import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Colors, Title, Button } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import { useReviewFiles } from 'hooks/useReviewFiles';
import { selectDiagrams } from 'modules/contextualization/pnidParsing';
import { useHistory, useParams } from 'react-router-dom';
import { diagramPreview } from 'routes/paths';
import { getSelectedDiagramsIds } from './selectors';

const Bar = styled(Flex)`
  position: sticky;
  bottom: 4px;
  justify-content: space-between;
  width: 100%;
  height: 52px;
  border-radius: 8px;
  margin: 8px 0;
  background-color: ${Colors['greyscale-grey10'].hex()};
`;
const Buttons = styled(Flex)`
  & > * {
    margin-right: 8px;
  }
`;

export default function SettingsBar() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { tenant, workflowId } =
    useParams<{ tenant: string; workflowId: string }>();

  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);

  const { onApproveDiagrams, onRejectDiagrams } =
    useReviewFiles(selectedDiagramsIds);

  const onPreviewSelectedClick = () => {
    history.push(
      diagramPreview.path(tenant, workflowId, selectedDiagramsIds[0])
    );
  };

  const onCancelClick = () => {
    dispatch(selectDiagrams({ workflowId, diagramIds: [] }));
  };

  return (
    <Bar row align>
      <Title
        level={6}
        style={{
          margin: '0 8px',
          color: Colors.white.hex(),
        }}
      >
        {selectedDiagramsIds.length} diagrams selected
      </Title>
      <Buttons row>
        <Button type="ghost-danger" onClick={() => onRejectDiagrams()}>
          Reject tags on selected diagrams
        </Button>
        <Button
          type="ghost"
          variant="inverted"
          onClick={() => onApproveDiagrams()}
        >
          Approve tags on selected diagrams
        </Button>
        <Button
          type="primary"
          variant="inverted"
          onClick={onPreviewSelectedClick}
        >
          Preview selected
        </Button>
        <Button
          type="secondary"
          icon="XLarge"
          variant="inverted"
          onClick={onCancelClick}
        />
      </Buttons>
    </Bar>
  );
}
