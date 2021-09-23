import styled from 'styled-components';

export const DropTextWrapper = styled.div`
  padding: 12px;
  color: var(--cogs-greyscale-grey6);
`;

export const DropWrapper = styled.div`
  border: 1px solid var(--cogs-border-default);
  background: var(--cogs-bg-accent);
  padding: 24px;
  text-align: center;
`;

export const HiddenInputFile = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;
