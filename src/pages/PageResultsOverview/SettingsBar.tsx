import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Colors, Title } from '@cognite/cogs.js';
import { ModalSaveSVG } from 'containers';
import { Flex, MenuButton } from 'components/Common';
import { useReviewFiles, useConvertToSVG } from 'hooks';
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
  const [showModal, setShowModal] = useState<boolean>(false);

  const { tenant, workflowId } =
    useParams<{ tenant: string; workflowId: string }>();
  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);
  const { isConverting } = useConvertToSVG(selectedDiagramsIds);
  const { onApproveDiagrams, onRejectDiagrams } =
    useReviewFiles(selectedDiagramsIds);

  const onCancelClick = () => {
    dispatch(selectDiagrams({ workflowId, diagramIds: [] }));
  };
  const onPreviewSelectedClick = () => {
    history.push(
      diagramPreview.path(tenant, workflowId, selectedDiagramsIds[0])
    );
  };
  const onSaveSVGClick = () => setShowModal(true);

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
        <MenuButton
          type="ghost-danger"
          variant="inverted"
          onClick={() => onRejectDiagrams()}
          style={{ color: Colors['red-5'].hex() }}
        >
          Reject selected tags
        </MenuButton>
        <MenuButton
          type="ghost"
          variant="inverted"
          onClick={() => onApproveDiagrams()}
        >
          Approve selected tags
        </MenuButton>
        <MenuButton
          type="ghost"
          variant="inverted"
          onClick={onPreviewSelectedClick}
        >
          Preview selected
        </MenuButton>
        <MenuButton
          type="tertiary"
          icon={isConverting ? 'LoadingSpinner' : undefined}
          disabled={isConverting}
          onClick={onSaveSVGClick}
        >
          Save as SVG
        </MenuButton>
        <MenuButton
          type="secondary"
          icon="XLarge"
          variant="inverted"
          onClick={onCancelClick}
        />
        <ModalSaveSVG
          diagramIds={selectedDiagramsIds}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      </Buttons>
    </Bar>
  );
}
