import styled from 'styled-components/macro';

import { Tuplet } from '../types';

export const VerticalRibbon = styled.div`
  width: 2px;
  position: absolute;
  height: 100%;
  background: var(--cogs-midorange);
  top: 0;
  left: ${(props: { position: number }) => props.position}px;
`;

export const HorizontalRibbon = styled.div`
  width: 100%;
  position: absolute;
  height: 2px;
  background: var(--cogs-midorange);
  top: ${(props: { position: number }) => `${props.position}px`};
`;

export const InfoViewerWrapper = styled.div`
  position: absolute;
  background: var(--cogs-black);
  color: var(--cogs-white);
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 10px;
  opacity: 0.8;
  line-height: 16px;
  left: ${(props: { position: Tuplet }) =>
    props?.position?.length ? props.position[0] + 10 : 10}px;
  top: ${(props: { position: Tuplet }) =>
    `${getThePosition(props.position)}px`};
`;

const getThePosition = (position: Tuplet): number => {
  if (position.length <= 1) {
    return 0;
  }

  return position[1] < 100 ? position[1] + 10 : position[1] - 100;
};

export const CanvasOverlay = styled.div`
  position: absolute;
  width: ${(props: { width: number }) => `${props.width}px`};
  height: ${(props: { height: number }) => `${props.height}px`};
`;
