import styled from 'styled-components';

import { CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER } from 'common';
import { CanvasBlock, CanvasBlockType } from 'components/canvas-block';

import { blocks } from './blocks';

export const CanvasSidePanel = (): JSX.Element => {
  const onDragStart = (
    event: React.DragEvent<Element>,
    type: CanvasBlockType
  ) => {
    event.dataTransfer.setData(
      CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
      type
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <StyledSidePanelContainer>
      {blocks.map((blockProps) => (
        <CanvasBlock
          key={blockProps.label}
          onDragStart={(event) => onDragStart(event, blockProps.type)}
          {...blockProps}
        />
      ))}
    </StyledSidePanelContainer>
  );
};

const StyledSidePanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;
