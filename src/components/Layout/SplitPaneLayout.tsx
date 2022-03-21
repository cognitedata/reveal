import * as React from 'react';
import styled from 'styled-components/macro';
import SplitPane from 'react-split-pane';
import Layers from 'utils/z-index';
import handle from '../../assets/dragHandle.svg';

const StyledSplitPane = styled(SplitPane)`
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
    height: 14px;
    border-top: 1px solid var(--cogs-greyscale-grey4);
    opacity: 1;
    margin-top: 10px;
    cursor: row-resize;

    &::before {
      content: url(${handle});
      position: absolute;
      z-index: ${Layers.MAXIMUM};
      top: -2px;
      width: 24px;
      height: 14px;
      left: calc(50% - 12px);
    }
    &:hover {
      background: var(--cogs-greyscale-grey1);
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
