import styled from 'styled-components';

export const Container = styled.span`
  display: flex;
  padding-bottom: 16px;

  .cogs-select {
    margin-right: 8px;
    flex: 1;
    max-width: 260px;
    min-width: 150px;
  }

  .cogs-switch {
    background-color: var(--cogs-bg-control--secondary);
    padding: 0 10px;
    border-radius: 6px;
    min-width: 150px;
  }
`;
