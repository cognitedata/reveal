import styled from 'styled-components';

export const Container = styled.div`
  padding: 32px 0;
  margin: 0 32px;
  border-bottom: 1px solid var(--cogs-border-default);
  display: flex;
  align-items: center;
`;
export const Content = styled.div`
  flex-grow: 1;
`;
export const Plant = styled.div`
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;
export const Unit = styled.div`
  font-weight: 700;
  color: var(--cogs-text-secondary);
`;
export const Actions = styled.div`
  flex-shrink: 0;
`;
