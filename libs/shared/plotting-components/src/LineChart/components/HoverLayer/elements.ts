import styled from 'styled-components/macro';
import { HOVER_MARKER_BORDER_WIDTH, MARKER_SIZE } from '../../constants';
import { LINE_INFO_POINTER_SIZE } from './HoverLineInfo';

const HOVER_LINE_INFO_BACKGROUND_COLOR = 'var(--cogs-surface--muted--inverted)';

export const HoverLayerWrapper = styled.div`
  pointer-events: none;
`;

export const Line = styled.div`
  position: absolute;
  border-left: 1px solid var(--cogs-decorative--grayscale--black);
  transition: opacity 0.4s ease;
`;

export const LineMarker = styled.div`
  position: absolute;
  height: ${MARKER_SIZE}px;
  width: ${MARKER_SIZE}px;
  border-radius: 50%;
  outline: ${HOVER_MARKER_BORDER_WIDTH}px solid var(--cogs-surface--muted);
`;

export const LineInfoWrapper = styled.div`
  transition: opacity 0.4s ease;
`;

export const LineInfoPointer = styled.div`
  position: absolute;
  bottom: 100%;
  border-width: ${LINE_INFO_POINTER_SIZE}px;
  border-style: solid;
  border-color: transparent transparent ${HOVER_LINE_INFO_BACKGROUND_COLOR}
    transparent;
  transform: translateX(-50%);
`;

export const LineInfo = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  white-space: nowrap;
  color: var(--cogs-text-icon--on-contrast--strong);
  background: ${HOVER_LINE_INFO_BACKGROUND_COLOR};
  border-radius: 6px;
  padding: 8px;
  font-size: 12px;
  transform: translateX(-50%);
  margin-top: 6px;
`;
