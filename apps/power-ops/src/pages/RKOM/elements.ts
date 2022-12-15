import styled from 'styled-components/macro';

const sidePanelOpenedWidth = 280;
const sidePanelClosedWidth = 68;

interface SidePanelProps {
  sidePanelOpen: boolean;
}

export const MainDiv = styled.div<SidePanelProps>`
  width: calc(
    100% -
      ${(props) =>
        props.sidePanelOpen ? sidePanelOpenedWidth : sidePanelClosedWidth}px
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
