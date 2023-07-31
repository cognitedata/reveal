import styled from 'styled-components';

export const Container = styled.div`
  border: 1px solid var(--cogs-border-default);
  padding: 16px;
  border-radius: 6px;
  margin-top: 24px;
`;

export const Header = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid var(--cogs-border-default);

  > .cogs-detail {
    color: var(--cogs-text-secondary);
    text-transform: uppercase;
  }

  > .cogs-title-5 {
    color: var(--cogs-text-primary);
  }
`;
