import styled, { keyframes } from 'styled-components';

const GRADIENT_SIZE = '640px';

const skeletonLoaderKeyframes = keyframes`
  from { background-position: -${GRADIENT_SIZE} 0; }
  to { background-position: ${GRADIENT_SIZE} 0; }
`;

export const Skeleton = styled.div`
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  display: block;
  animation-duration: 3s;
  animation-name: ${skeletonLoaderKeyframes};
  background-image: linear-gradient(
    to right,
    var(--cogs-surface--misc-code--muted) 0%,
    var(--cogs-surface--misc-code--medium) 20%,
    var(--cogs-surface--misc-code--muted) 40%
  );
  background-size: ${GRADIENT_SIZE} ${GRADIENT_SIZE};

  border-radius: 4px;

  height: 14px;
  width: 100%;
`;
