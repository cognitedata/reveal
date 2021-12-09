import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';

export const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const StyledGraphic = styled.div`
  margin: 1rem 0;
`;

export const StyledTitle = styled(Title)`
  margin: 0.5rem 0;
  font-weight: normal;
  color: var(--cogs-greyscale-grey6);
`;

export const StyledContent = styled.div`
  text-align: center;
`;
