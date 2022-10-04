import {
  Body,
  Colors,
  Elevations,
  Flex,
  Icon,
  IconType,
} from '@cognite/cogs.js';
import styled from 'styled-components';

export const CANVAS_BLOCK_TYPES = [
  'data-set',
  'entity-matching',
  'extraction-pipeline',
  'raw-table',
  'transformation',
] as const;
export type CanvasBlockType = typeof CANVAS_BLOCK_TYPES[number];

export type CanvasBlockItem = {
  icon: IconType;
  iconColor?: string; // FIXME: change to cogs color token type
  label: string;
  type: CanvasBlockType;
};

type CanvasBlockProps = {
  onDragStart: React.DragEventHandler;
} & CanvasBlockItem;

export const CanvasBlock = ({
  icon,
  iconColor,
  label,
  onDragStart,
}: CanvasBlockProps): JSX.Element => {
  return (
    <StyledBlockContainer draggable onDragStart={onDragStart}>
      <Flex alignItems="center" gap={8}>
        <StyledBlockIcon $color={iconColor} type={icon} />
        <Body level={3} strong>
          {label}
        </Body>
      </Flex>
      <StyledDragHandleIcon />
    </StyledBlockContainer>
  );
};

const StyledBlockContainer = styled.div`
  align-items: center;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  cursor: grab;
  display: flex;
  justify-content: space-between;
  padding: 16px;

  :hover {
    border-color: ${Colors['border--interactive--alt']};
    box-shadow: ${Elevations['elevation--surface--interactive']};
  }

  /* FIXME: we can add grabbing state while dragging */
`;

const StyledBlockIcon = styled(Icon)<{ $color?: string }>`
  color: ${({ $color }) => $color ?? Colors['border--interactive--default']};
`;

const StyledDragHandleIcon = styled(Icon).attrs({ type: 'DragHandleVertical' })`
  color: ${Colors['border--interactive--default']};
`;
