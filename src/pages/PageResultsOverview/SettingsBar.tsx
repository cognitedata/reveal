import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Button, Title, Colors } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
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
  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);

  const onDeleteSelectedClick = () => {};
  const onApproveSelectedClick = () => {};
  const onPreviewSelectedClick = () => {};
  const onCancelClick = () => {};

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
        <Button type="ghost-danger" onClick={onDeleteSelectedClick}>
          Delete selected tags
        </Button>
        <Button
          type="ghost"
          variant="inverted"
          onClick={onApproveSelectedClick}
        >
          Approve selected tags
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
