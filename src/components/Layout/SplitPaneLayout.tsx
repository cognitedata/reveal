import * as React from 'react';
import styled from 'styled-components/macro';
import SplitPane from 'react-split-pane';
import Layers from 'utils/z-index';
import handle from './dragHandle.svg';

export const StyledSplitPane = styled(SplitPane)`
  .Pane {
    max-width: 100vw;
    max-height: 100vh;
  }
  .Pane1 {
    overflow: auto;
  }
  .Resizer {
    background: transparent;
    box-sizing: border-box;
    background-clip: padding-box;
    transition: all 0.35s ease;
  }
  .Resizer:hover {
    transition: all 0.35s ease;
  }
  .Resizer.horizontal {
    position: relative;
    width: 100%;
    height: 4px;
    border-bottom: 1px solid var(--cogs-greyscale-grey3);
    opacity: 1;
    margin-bottom: 13px;
    cursor: row-resize;

    &::before {
      content: url(${handle});
      position: absolute;
      z-index: ${Layers.MAXIMUM};
      top: -7px;
      width: 36px;
      height: 24px;
      left: calc(50% - 10px);
      background: white;
      border: 1px solid var(--cogs-greyscale-grey3);
      border-radius: 5px;
      padding: 3px 9px;
    }
  }
  .Resizer.disabled {
    cursor: not-allowed;
  }
  .Resizer.disabled:hover {
    border-color: transparent;
  }
`;

type SplitPaneProps = {
  children: React.ReactNode;
  defaultSize?: number;
};

const getDefaultSize = () => {
  const height = window.innerHeight;
  if (height <= 600) {
    return height * 0.4;
  }
  if (height <= 800) {
    return height * 0.5;
  }
  return height * 0.3;
};

const SplitPaneLayout = ({
  children,
  defaultSize = getDefaultSize(),
}: SplitPaneProps) => (
  <StyledSplitPane
    split="horizontal"
    primary="second"
    defaultSize={defaultSize}
    onDragFinished={() => {
      document.dispatchEvent(new Event('panelResize'));
      window.dispatchEvent(new Event('resize'));
    }}
  >
    {children}
  </StyledSplitPane>
);

export default SplitPaneLayout;
