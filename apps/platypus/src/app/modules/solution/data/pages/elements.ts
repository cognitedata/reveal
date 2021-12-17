import { Tabs } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const StyledSchemaVersion = styled.div`
  margin-left: 10px;
`;

export const StyledPage = styled.div`
  flex: 1;
`;

export const StyledTabs = styled(Tabs)`
  border-bottom: solid 1px var(--cogs-greyscale-grey4);
`;
