import { Body, Button, Tabs } from '@cognite/cogs.js';
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

export const DiscardButton = styled(Button)`
  margin-right: 10px;
  white-space: nowrap;
`;

// These colors are from the secondary variant of the Button in our design system
// For some reason the Cogs secondary Button component uses a different color
export const ReturnButton = styled(Button)`
  background: rgba(83, 88, 127, 0.08);

  &:hover {
    background: rgba(83, 88, 127, 0.12);
  }

  &:active {
    background: rgba(83, 88, 127, 0.16);
  }
`;
