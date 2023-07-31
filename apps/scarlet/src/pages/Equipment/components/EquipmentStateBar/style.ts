import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
`;

export const ProgressContainer = styled.div<{ progress: number }>`
  width: 210px;
  position: relative;
  height: 36px;
  display: flex;
  justify-content: space-between;

  &:before,
  &:after {
    content: '';
    display: block;
    height: 8px;
    width: 100%;
    background-color: var(--cogs-green-6);
    position: absolute;
    bottom: 0;
    left: 0;
    border-radius: 4px;
  }

  &:after {
    content: '';
    width: ${({ progress }) =>
      progress === 0 || progress === 100
        ? progress
        : Math.min(95, Math.max(5, progress))}%;
    background-color: var(--cogs-green-5);
  }
`;

export const ProgressLabel = styled.div`
  color: var(--cogs-black);
`;

export const SaveState = styled.div`
  color: rgba(0, 0, 0, 0.45);
`;
