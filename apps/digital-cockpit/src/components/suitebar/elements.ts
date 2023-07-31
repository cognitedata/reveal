import styled from 'styled-components/macro';

export const SuitbarContainer = styled.div`
  display: flex;
  border-radius: 4px;
  button {
    margin-left: 15px;
  }
  .action-button-text {
    @media (max-width: 1190px) {
      display: none;
    }
  }
`;

export const MainContent = styled.div`
  display: flex;
  width: 100%;
  height: 56px;
  align-items: center;
  background-color: var(--cogs-white);
  padding: 10px 48px 10px 48px;
  border-bottom: 1px solid var(--cogs-color-strokes-default);
  & > :last-child {
    margin-left: auto;
  }
`;
