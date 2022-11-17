import styled from 'styled-components/macro';
import { BaseContainer } from 'styles/layout';

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
`;

export const Container = styled(BaseContainer)`
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
`;
