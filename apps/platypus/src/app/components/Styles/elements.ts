import { Title } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const StyledMainTitle = styled(Title)`
  display: flex;
  flex-direction: column;
  padding: 0px 0 10px 0;
  margin-bottom: 20px;
  border-bottom: solid 1px var(--cogs-greyscale-grey3);
`;

export const StyledGroupTitle = styled(Title)`
  display: inline-flex;
  flex-direction: column;
  padding: 10px 0 10px 0;
  margin-bottom: 20px;
`;

export const StyledDescriptionWrapper = styled.div`
  border-left: solid 7px var(--cogs-greyscale-grey2);
  padding: 5px 20px 5px 20px;
`;

export const StyledDescriptionTitle = styled(Title)`
  padding: 0px 0 0px 0;
  margin: 0px 0 0 0;
`;

export const StyledUnderline = styled.div`
  width: 30%;
  margin-top: 8px;
  border-bottom: solid 5px var(--cogs-primary);
`;
