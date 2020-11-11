import styled from 'styled-components/macro';

export const SuitbarContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--cogs-white);
  box-shadow: var(--cogs-z-1);
  border-radius: 4px;
  padding: 12px 48px;
  & > :last-child {
    margin-left: auto;
  }
`;
