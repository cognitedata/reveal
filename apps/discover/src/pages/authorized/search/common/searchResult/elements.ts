import styled from 'styled-components/macro';

import { Body, Button, Menu } from '@cognite/cogs.js';

import { GreyBadge } from 'components/Badge';

export const BreadCrumbButton = styled(Button)`
  background-color: #ebf2fc;
  color: #357ae2;
  font-weight: 400;
`;

export const BreadCrumbMenu = styled(Menu)`
  max-height: 60vh;
  overflow-y: scroll;
`;

export const BreadCrumbHeader = styled(Menu.Header)`
  font-size: 12px;
  font-weight: 400;
  margin-top: 0;
`;

export const Title = styled(Body).attrs({ level: 2 })`
  color: var(--cogs-greyscale-grey7);
  font-weight: 500;
`;

export const Badge = styled(GreyBadge).attrs({
  color: 'greyscale-grey3',
  borderRadius: '4px',
  padding: '1px 6px',
})``;

export const DividerWrapper = styled.span`
  .cogs-menu-divider {
    margin-top: 8px;
    margin-bottom: 8px;
  }
`;

export const BreadCrumbItem = styled(Menu.Item)`
  cursor: default !important;
  min-height: 32px;
  &:hover {
    background-color: transparent !important;
  }
`;
