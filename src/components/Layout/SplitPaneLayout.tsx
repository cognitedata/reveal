import * as React from 'react';
import styled from 'styled-components/macro';
import SplitPane from 'react-split-pane';
import Layers from 'utils/z-index';

const handle =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYuNzUgNS43NUM2Ljc1IDYuNDQwMzYgNy4zMDk2NCA3IDggN0M4LjY5MDM2IDcgOS4yNSA2LjQ0MDM2IDkuMjUgNS43NUM5LjI1IDUuMDU5NjQgOC42OTAzNiA0LjUgOCA0LjVDNy4zMDk2NCA0LjUgNi43NSA1LjA1OTY0IDYuNzUgNS43NVoiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTExLjI1IDUuNzVDMTEuMjUgNi40NDAzNiAxMS44MDk2IDcgMTIuNSA3QzEzLjE5MDQgNyAxMy43NSA2LjQ0MDM2IDEzLjc1IDUuNzVDMTMuNzUgNS4wNTk2NCAxMy4xOTA0IDQuNSAxMi41IDQuNUMxMS44MDk2IDQuNSAxMS4yNSA1LjA1OTY0IDExLjI1IDUuNzVaIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yLjI1IDUuNzVDMi4yNSA2LjQ0MDM2IDIuODA5NjQgNyAzLjUgN0M0LjE5MDM2IDcgNC43NSA2LjQ0MDM2IDQuNzUgNS43NUM0Ljc1IDUuMDU5NjQgNC4xOTAzNiA0LjUgMy41IDQuNUMyLjgwOTY0IDQuNSAyLjI1IDUuMDU5NjQgMi4yNSA1Ljc1WiIgZmlsbD0iIzMzMzMzMyIvPgo8cGF0aCBkPSJNNi43NSAxMC4yNUM2Ljc1IDEwLjk0MDQgNy4zMDk2NCAxMS41IDggMTEuNUM4LjY5MDM2IDExLjUgOS4yNSAxMC45NDA0IDkuMjUgMTAuMjVDOS4yNSA5LjU1OTY0IDguNjkwMzYgOSA4IDlDNy4zMDk2NCA5IDYuNzUgOS41NTk2NCA2Ljc1IDEwLjI1WiIgZmlsbD0iIzMzMzMzMyIvPgo8cGF0aCBkPSJNMTEuMjUgMTAuMjVDMTEuMjUgMTAuOTQwNCAxMS44MDk2IDExLjUgMTIuNSAxMS41QzEzLjE5MDQgMTEuNSAxMy43NSAxMC45NDA0IDEzLjc1IDEwLjI1QzEzLjc1IDkuNTU5NjQgMTMuMTkwNCA5IDEyLjUgOUMxMS44MDk2IDkgMTEuMjUgOS41NTk2NCAxMS4yNSAxMC4yNVoiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTIuMjUgMTAuMjVDMi4yNSAxMC45NDA0IDIuODA5NjQgMTEuNSAzLjUgMTEuNUM0LjE5MDM2IDExLjUgNC43NSAxMC45NDA0IDQuNzUgMTAuMjVDNC43NSA5LjU1OTY0IDQuMTkwMzYgOSAzLjUgOUMyLjgwOTY0IDkgMi4yNSA5LjU1OTY0IDIuMjUgMTAuMjVaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=';

const StyledSplitPane = styled(SplitPane)<SplitPaneProps>`
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
