import { Detail, Title as CogsTitle } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Container = styled.div`
  background-color: var(--cogs-white);
  border-bottom: 1px solid var(--cogs-border-default);
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Title = styled(CogsTitle)`
  color: var(--cogs-greyscale-grey7);
  padding: 0 12px;
`;

export const DocumentsNumber = styled(Detail)`
  color: var(--cogs-greyscale-grey6);
  background-color: var(--cogs-greyscale-grey2);
  padding: 4px 8px;
  border-radius: 2px;
`;

export const StateContainer = styled.div`
  margin-left: auto;
`;
