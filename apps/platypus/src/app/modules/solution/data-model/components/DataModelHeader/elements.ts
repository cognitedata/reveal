import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

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

export const DocLinkWrapper = styled('div')`
  display: flex;

  &:before {
    border-left: 1px solid rgba(0, 0, 0, 0.15);
    content: '';
    height: 36px;
    margin: 0 8px 0 0;
    width: 1px;
  }
`;
