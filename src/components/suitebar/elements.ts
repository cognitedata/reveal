import styled from 'styled-components/macro';

export const SuitbarContainer = styled.div`
  display: flex;
  box-shadow: var(--cogs-z-1);
  border-radius: 4px;
`;

export const MainContent = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  background-color: var(--cogs-white);
  padding: 10px 48px 10px 24px;
  & > :last-child {
    margin-left: auto;
  }
`;

export const StyledTitle = styled.div`
  padding-left: 24px;
`;

export const StyledButton = styled.div`
  & > .cogs-btn-secondary {
    padding: 28px 24px;
    border-radius: 0;

    & .cogs-icon svg {
      width: inherit;
      height: auto;
    }
  }
`;
