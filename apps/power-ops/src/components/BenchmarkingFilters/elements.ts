import styled from 'styled-components/macro';

export const Container = styled.span`
  display: flex;
  padding-bottom: 16px;
  align-items: stretch;

  .cogs-select {
    margin-right: 8px;
    flex: 1;
  }

  .cogs-switch {
    background-color: var(--cogs-surface--action--muted--default);
    padding: 0 10px;
    border-radius: 6px;
  }
`;
