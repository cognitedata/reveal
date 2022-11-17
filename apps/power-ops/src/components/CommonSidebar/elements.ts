import styled from 'styled-components/macro';

const sidePanelOpenedWidth = 280;
const sidePanelClosedWidth = 68;

interface SidePanelProps {
  sidePanelOpened: boolean;
}

export const StyledPanel = styled.div<SidePanelProps>`
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--cogs-bg-control--disabled);

  width: ${(props) =>
    props.sidePanelOpened ? sidePanelOpenedWidth : sidePanelClosedWidth}px;

  transition-property: width, transform, left, right;
  transition-duration: var(--cogs-transition-time);
`;

export const Footer = styled.span`
  display: flex;
  position: absolute;
  padding: 16px;
  background: var(--cogs-bg-default);
  border-top: 1px solid var(--cogs-bg-control--disabled);
  bottom: 0;
  width: 100%;

  Button {
    width: 100%;
  }
`;

export const Header = styled.span`
  display: flex;
  position: sticky;
  padding: 16px;
  text-align: left;
  align-items: center;
  background: var(--cogs-bg-default);
  border-bottom: 1px solid var(--cogs-bg-control--disabled);
  top: 0;
  position: sticky;

  .cogs-label {
    margin: 4px 0 0 0;
  }

  Button {
    margin-left: auto;
  }

  .cogs-icon {
    color: rgba(0, 0, 0, 0.45);
  }
`;
