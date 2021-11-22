import styled from 'styled-components';
import { Body } from '@cognite/cogs.js';

export const StatesContainer = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  height: 100%;
  width: 100%;
`;

export const StatesTitle = styled(Body).attrs({ level: 1, strong: true })`
  margin-top: 1.5rem;
`;

export const StatesDescription = styled(Body).attrs({ level: 2 })`
  margin-top: 0.3rem;
  text-align: center;
`;

export const Image = styled.img`
  height: 120px;
`;
