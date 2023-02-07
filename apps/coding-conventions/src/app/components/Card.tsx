import styled from 'styled-components';

export const Card = styled.div.attrs({ role: 'button' })`
  min-width: 270px;
  height: 160px;
  border-radius: 10px;
  box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.1),
    0px 1px 1px rgba(79, 82, 104, 0.1);
  padding: 20px;
  cursor: pointer;

  transition: all 300ms;

  &:hover {
    box-shadow: 0px 6px 20px 2px rgba(79, 82, 104, 0.06),
      0px 2px 6px 1px rgba(79, 82, 104, 0.12);
  }
`;

export const EmptyCard = styled(Card)`
  background: var(--cogs-surface--medium);
  border: 1px solid var(--cogs-border--muted);
  box-shadow: none;
  &:hover {
    box-shadow: none;
  }
`;
