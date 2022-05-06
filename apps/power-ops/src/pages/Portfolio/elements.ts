import styled from 'styled-components/macro';
import { BaseContainer } from 'pages/elements';
import { Title } from '@cognite/cogs.js';

const sidePanelOpenedWidth = 280;
const sidePanelClosedWidth = 68;

interface SidePanelProps {
  sidePanelOpened: boolean;
}

export const MainDiv = styled.div<SidePanelProps>`
  width: calc(
    100% -
      ${(props) =>
        props.sidePanelOpened ? sidePanelOpenedWidth : sidePanelClosedWidth}px
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

export const PanelContent = styled.div`
  position: absolute;
  padding: 16px;
  max-height: calc(100% - 138px);
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .cogs-detail {
    display: flex;
    color: var(--cogs-text-secondary);
    margin: 8px 0 8px 0;
    text-align: left;
  }
`;

export const StyledTitle = styled(Title)`
  font-family: 'Inter';
`;
