import styled from 'styled-components/macro';

const sidebarOpenedWidth = 280;
const sidebarClosedWidth = 68;

interface SidebarProps {
  sidebarOpen: boolean;
}

export const MainDiv = styled.div<SidebarProps>`
  width: calc(
    100% -
      ${(props) =>
        props.sidebarOpen ? sidebarOpenedWidth : sidebarClosedWidth}px
  );

  transition-property: width, transform, left, right;
  transition-duration: var(--cogs-transition-time);
  right: 0;
  position: absolute;
  height: 100%;
`;

export const Container = styled.div`
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
`;

export const MainContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
