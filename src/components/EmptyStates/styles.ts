import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';

export const EmptyStateContainer = styled.div`
  width: 100%;
  height: calc(100vh - 400px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const EmptyStateTitle = styled(Title)`
  font-weight: bold;
  margin-bottom: 10pt;
`;

export const EmptyStateText = styled.div`
  font-size: 1.2em;
`;
