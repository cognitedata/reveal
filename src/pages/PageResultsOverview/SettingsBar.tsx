import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Body, Colors, Title, Button } from '@cognite/cogs.js';
import { Modal } from 'antd';
import { Flex } from 'components/Common';
import { REVIEW_DIAGRAMS_LABELS, useReviewFiles } from 'hooks/useReviewFiles';
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

  const { onApproved, onRejected } = useReviewFiles(
    selectedDiagramsIds.map((id: any) => Number(id))
  );

  const onRejectSelectedClick = async () => {
    Modal.confirm({
      icon: <></>,
      width: 320,
      maskClosable: true,
      okText: REVIEW_DIAGRAMS_LABELS.reject.some.button,
      cancelText: 'Cancel',
      cancelButtonProps: { type: 'text' },
      content: <Body level={2}>{REVIEW_DIAGRAMS_LABELS.reject.some.desc}</Body>,
      onOk: async () =>
        onRejected(selectedDiagramsIds.map((id: any) => Number(id))),
    });
  };

  const onApproveSelectedClick = async () => {
    Modal.confirm({
      icon: <></>,
      width: 320,
      maskClosable: true,
      okText: REVIEW_DIAGRAMS_LABELS.approve.some.button,
      cancelText: 'Cancel',
      cancelButtonProps: { type: 'text' },
      content: (
        <Body level={2}>{REVIEW_DIAGRAMS_LABELS.approve.some.desc}</Body>
      ),
      onOk: async () =>
        onApproved(selectedDiagramsIds.map((id: any) => Number(id))),
    });
  };
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
        <Button type="ghost-danger" onClick={onRejectSelectedClick}>
          Reject tags on selected diagrams
        </Button>
        <Button
          type="ghost"
          variant="inverted"
          onClick={onApproveSelectedClick}
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
