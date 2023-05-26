import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

export const DiscardButton = styled(Button)`
  margin-right: 10px;
  white-space: nowrap;
`;

// These colors are from the secondary variant of the Button in our design system
// For some reason the Cogs secondary Button component uses a different color
export const ReturnButton = styled(Button)`
  background: rgba(83, 88, 127, 0.08) !important;

  &:hover {
    background: rgba(83, 88, 127, 0.12) !important;
  }

  &:active {
    background: rgba(83, 88, 127, 0.16) !important;
  }
`;
