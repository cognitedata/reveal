import { Body, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const StyledSchemaVersion = styled(Body)`
  margin-left: 10px;
  font-weight: 600;
`;

export const StyledPage = styled.div`
  flex: 1;
`;

export const StyledTabs = styled(Tabs)`
  border-bottom: solid 1px var(--cogs-greyscale-grey4);
`;
