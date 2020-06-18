import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { colors } from './global-styles';

export const Layout = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row-reverse;
  background-color: ${colors.mainBackground};
`;

export const Sidebar = styled.nav`
  background-color: white;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.1);
  width: 80px;
`;

export const Main = styled.div`
  background-color: ${colors.mainBackground};
  flex-grow: 1;
`;

export const Header = styled.header`
  height: 144px;
  padding: 40px 48px 0 48px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 32px;
    color: ${colors.grey7};
  }
`;

export const MainMenu = styled.nav`
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
  color: ${colors.grey8};
  font-weight: 600;
  font-size: 14px;
  border-bottom: 3px solid transparent;
  &.active {
    border-bottom-color: ${colors.midBlue};
    color: ${colors.grey10};
  }
`;

export const Content = styled.main`
  padding: 32px 48px;
`;
