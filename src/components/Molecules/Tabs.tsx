import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const MainMenu = styled.nav`
  display: block;
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    li {
      margin-right: 16px;
    }
  }
`;

export const MenuLink = styled(NavLink)`
  text-decoration: none;
  padding: 8px 12px 10px 12px;
  display: block;
  color: var(--cogs-greyscale-grey8);
  font-weight: 600;
  font-size: 14px;
  border-bottom: 3px solid transparent;
  &.active {
    border-bottom-color: var(--cogs-midblue);
    color: var(--cogs-greyscale-grey10);
  }
`;

type MenuItem = {
  url: string;
  label: string;
};

type Props = {
  items: MenuItem[];
};

const Tabs = ({ items }: Props) => {
  return (
    <MainMenu>
      <ul>
        {items.map((item) => (
          <li key={`tab${item.url}`}>
            <MenuLink to={item.url}>{item.label}</MenuLink>
          </li>
        ))}
      </ul>
    </MainMenu>
  );
};

export default Tabs;
