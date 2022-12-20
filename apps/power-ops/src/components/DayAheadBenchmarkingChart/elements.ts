import styled from 'styled-components';

export const PlotContainer = styled.div`
  display: flex;
  justify-content: 'center';
  flex-direction: column;
  background-color: var(--cogs-surface--medium);
  padding: 16px;
  border-radius: 12px;
  font-family: 'Inter';
  height: 100%;

  .subtitle {
    margin-top: 4px;
    color: var(--cogs-text-icon--muted);
  }
`;
