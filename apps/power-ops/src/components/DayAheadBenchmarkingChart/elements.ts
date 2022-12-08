import styled from 'styled-components/macro';

export const PlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--cogs-surface--medium);
  padding: 16px;
  border-radius: 12px;
  font-family: 'Inter';

  .subtitle {
    margin-top: 4px;
    color: var(--cogs-text-icon--muted);
  }
`;
