import { Colors, Elevations, Overline } from '@cognite/cogs.js';
import CanvasBlockIllustration from 'components/canvas-block-illustration';
import styled from 'styled-components';

export const CANVAS_BLOCK_TYPES = [
  'data-set',
  'engineering-diagram',
  'entity-matching',
  'extraction-pipeline',
  'raw-table',
  'transformation',
] as const;
export type CanvasBlockType = typeof CANVAS_BLOCK_TYPES[number];

export type CanvasBlockItem = {
  label: string;
  type: CanvasBlockType;
};

type CanvasBlockProps = {
  onDragStart: React.DragEventHandler;
} & CanvasBlockItem;

export const CanvasBlock = ({
  label,
  onDragStart,
  type,
}: CanvasBlockProps): JSX.Element => {
  return (
    <StyledBlockContainer draggable onDragStart={onDragStart}>
      <CanvasBlockIllustration type={type} />
      <Overline level={3}>{label}</Overline>
    </StyledBlockContainer>
  );
};

const StyledBlockContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 4px;
  width: 128px;

  :hover {
    border-color: ${Colors['border--interactive--alt']};
    box-shadow: ${Elevations['elevation--surface--interactive']};
  }

  /* FIXME: we can add grabbing state while dragging */
`;
