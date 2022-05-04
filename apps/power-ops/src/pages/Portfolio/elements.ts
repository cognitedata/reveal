import styled from 'styled-components/macro';
import { BaseContainer } from 'pages/elements';
import { Title, Input, Button } from '@cognite/cogs.js';

const sidePanelOpenWidth = 280;
const sidePanelClosedWidth = 68;

interface SidePanelProps {
  sidePanelOpen: boolean;
}

export const Header = styled.span`
  display: flex;
  position: sticky;
  padding: 16px;
  text-align: left;
  align-items: center;
  background: var(--cogs-bg-default);
  border-bottom: 1px solid var(--cogs-bg-control--disabled);

  .cogs-label {
    margin: 4px 0 0 0;
  }

  Button {
    margin-left: auto;
  }

  &.top {
    top: 56px;
  }

  &.search {
    top: 0;
    position: sticky;

    .cogs-icon {
      color: rgba(0, 0, 0, 0.45);
    }
  }
`;

export const LeftPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--cogs-bg-control--disabled);

  transition-property: width, transform, left, right;
  transition-duration: var(--cogs-transition-time);
`;

export const RightPanel = styled.div`
  transition-property: width, transform, left, right;
  transition-duration: var(--cogs-transition-time);
`;

export const Container = styled(BaseContainer)<SidePanelProps>`
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;

  ${LeftPanel} {
    width: ${(props) =>
      props.sidePanelOpen ? sidePanelOpenWidth : sidePanelClosedWidth}px;
  }

  ${RightPanel} {
    width: calc(
      100% -
        ${(props) =>
          props.sidePanelOpen ? sidePanelOpenWidth : sidePanelClosedWidth}px
    );
  }
`;

export const StyledSearch = styled(Input)`
  background: var(--cogs-bg-control--secondary);
  width: 100%;
  border: none;
  border-radius: 6px;
  color: var(--cogs-text-secondary);
  ::placeholder {
    color: var(--cogs-text-secondary);
  }
  .input-wrapper {
    width: 100%;
    .cogs-input {
      padding-right: 38px;
    }
  }
  .btn-reset {
    background: transparent;
  }
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

export const StyledButton = styled(Button)`
  width: 100%;
  align-items: center;
  justify-content: left;
  font-weight: 600;
  font-family: Inter;
  margin-bottom: 8px;

  p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }
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
