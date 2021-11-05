import styled from 'styled-components';
import { Body, Title } from '@cognite/cogs.js';

export const StatesContainer = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  height: 100%;
  width: 100%;
`;

export const StatesTitle = styled(Title).attrs({ level: 5 })`
  margin-top: 2rem;
`;

export const StatesDescription = styled(Body).attrs({ level: 2 })`
  margin-top: 0.5rem;
  text-align: center;
`;
