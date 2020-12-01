import React from 'react';
import styled from 'styled-components/macro';
import SplitPane from 'react-split-pane';

export const StyledSplitPane = styled(SplitPane)`
  position: relative !important;
  height: 100%;
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
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #ff6918 0%, #fc2574 99.6%);
    opacity: 1;
    cursor: row-resize;
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
