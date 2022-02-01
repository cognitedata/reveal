import { Button, Menu as CogsMenu } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  margin-left: -14px;
`;

export const BackButton = styled(Button)`
  color: var(--cogs-text-primary);
  flex-grow: 1;
  justify-content: flex-start;
  overflow: hidden;
  white-space: nowrap;

  > i {
    flex-shrink: 0;
  }
`;

export const Label = styled.span`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MenuWrapper = styled.div`
  flex-shrink: 0;
  position: relative;
`;

export const MenuButton = styled(Button)`
  color: var(--cogs-black);
`;

export const Menu = styled(CogsMenu)`
  position: absolute;
  top: 100;
  right: 0;
`;

export const MenuItem = styled(CogsMenu.Item)`
  color: #d67f05;
`;
