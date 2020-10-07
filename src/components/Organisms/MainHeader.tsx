import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import Logo from 'components/Atoms/Logo';
import { Avatar, Tooltip } from '@cognite/cogs.js';
import AppSwitcher from '../Atoms/AppSwitcher';

const Header = styled.header`
  display: flex;
  justify-content: space-between;

  height: 56px;

  background-color: var(--cogs-white);
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;

const HeaderItem = styled.div`
  display: flex;
  align-items: center;
`;

const TitleContainer = styled(HeaderItem)`
  border-right: 1px solid var(--cogs-greyscale-grey3);
  & > div:first-child {
    padding: 0 16px;
  }
  & > div:last-child {
    padding-right: 56px;
    h1 {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      margin: 0;
    }
    h2 {
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      margin: 0;
    }
  }
`;

const MenuContainer = styled(HeaderItem)`
  flex-grow: 2;

  padding-left: 24px;

  border-right: 1px solid var(--cogs-greyscale-grey3);
  & nav {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    & ul {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
    }
  }
`;

const MenuLink = styled(NavLink)`
  display: block;
  margin-right: 20px;
  padding: 0 16px 12px 12px;

  border-bottom: 3px solid transparent;
  color: var(--cogs-greyscale-grey10);
  text-align: center;

  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  &:hover,
  &:active {
    color: var(--cogs-greyscale-grey7);
  }

  &.active {
    &:hover,
    &:active {
      border-bottom: 3px solid var(--cogs-greyscale-grey7);
    }
    border-bottom: 3px solid var(--cogs-greyscale-grey10);
  }
`;

const AvatarContainer = styled(HeaderItem)`
  padding: 0 12px;

  border-right: 1px solid var(--cogs-greyscale-grey3);
`;

const ActionsContainer = styled(HeaderItem)`
  padding: 0 12px;
`;

const MainHeader = ({ user }: { user: string | null | undefined }) => {
  return (
    <Header>
      <TitleContainer>
        <div>
          <NavLink to="">
            <Logo />
          </NavLink>
        </div>
        <div>
          <h1>Discover</h1>
          <h2>Cognuit</h2>
        </div>
      </TitleContainer>
      <MenuContainer>
        <nav>
          <ul>
            <li>
              <MenuLink to="/configurations">Configurations</MenuLink>
            </li>
            <li>
              <MenuLink to="/data-transfers">Data Transfers</MenuLink>
            </li>
            <li>
              <MenuLink to="/status">Status</MenuLink>
            </li>
          </ul>
        </nav>
      </MenuContainer>
      <AvatarContainer>
        <Tooltip content={`Logged in: ${String(user)}`}>
          <Avatar text={String(user)} />
        </Tooltip>
      </AvatarContainer>
      <ActionsContainer>
        <AppSwitcher />
      </ActionsContainer>
    </Header>
  );
};

export default MainHeader;
