import styled from 'styled-components';

const MAX_Z = 999;

export const ContextMenuWrapper = styled.div`
  position: absolute;
  z-index: ${MAX_Z};
  background: #fff;
  border-radius: 4px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-shadow: var(--cogs-z-4);

  .cogs-btn {
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0;
    &:first-of-type {
      border-left: none;
    }
  }
`;
