import styled from 'styled-components/macro';

import { HOVER_MARKER_SIZE } from '../../constants';

export const HoverLayerWrapper = styled.div``;

export const Line = styled.div`
  position: absolute;
  border-left: 1px solid #000000;
  transition: opacity 0.4s ease;
`;

export const LineInfo = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  color: #ffffff;
  background: #262626;
  border-radius: 6px;
  padding: 8px;
  font-size: 12px;
  transform: translateX(-50%);
  margin-top: 6px;
  transition: opacity 0.4s ease;

  ::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent black transparent;
  }
`;

export const Marker = styled.div`
  position: absolute;
  width: ${HOVER_MARKER_SIZE}px;
  height: ${HOVER_MARKER_SIZE}px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 0.4s ease;
`;
