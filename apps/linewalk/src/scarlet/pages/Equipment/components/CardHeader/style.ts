import { Button, Menu as CogsMenu } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  margin: -8px 12px 16px -14px;
`;

export const BackButton = styled(Button)`
  color: var(--cogs-text-primary);
  flex-grow: 1;
  justify-content: flex-start;
  overflow: hidden;
  white-space: nowrap;
  height: auto;
  text-align: left;
  font-weight: 400;

  > i {
    flex-shrink: 0;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;

  > div {
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
`;

export const Title = styled.div`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
`;

export const Details = styled.div`
  color: var(--cogs-text-secondary);
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
