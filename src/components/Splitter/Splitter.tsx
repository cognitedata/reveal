import React from 'react';
import SplitterLayout from 'react-splitter-layout';
import styled, { css } from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { SIDEBAR_RESIZE_EVENT } from 'utils/WindowEvents';

export type SplitterProps = {
  secondaryMinSize?: number;
  percentage?: boolean;
  primaryIndex?: 0 | 1;
  children: React.ReactNode | React.ReactNode[];
};

export const Splitter = ({
  children,
  secondaryMinSize = 360,
  percentage = false,
  primaryIndex = 0,
}: SplitterProps) => (
  <SplitterWrapper>
    <SplitterLayout
      secondaryMinSize={secondaryMinSize}
      secondaryInitialSize={secondaryMinSize}
      primaryIndex={primaryIndex}
      onDragEnd={() => {
        window.dispatchEvent(new Event(SIDEBAR_RESIZE_EVENT));
      }}
      percentage={percentage}
    >
      {children}
    </SplitterLayout>
  </SplitterWrapper>
);

const SplitterWrapper = styled.div(
  () => css`
    flex: 1;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    position: relative;

    button.cogs-menu-item {
      color: ${Colors.black.hex()};
    }

    .splitter-layout {
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .splitter-layout .layout-pane {
      position: relative;
      flex: 0 0 auto;
      overflow: auto;
    }

    .splitter-layout .layout-pane > * {
      height: 100%;
      width: 100%;
    }

    .splitter-layout .layout-pane.layout-pane-primary {
      flex: 1 1 auto;
      overflow: visible;
    }

    .splitter-layout > .layout-splitter {
      flex: 0 0 auto;
      width: 4px;
      height: 100%;
      cursor: col-resize;
      transition: 0.3s all;
      background-color: rgba(0, 0, 0, 0.1);
    }

    .splitter-layout .layout-splitter:hover {
      background-color: ${Colors['midblue-7'].hex()};
    }

    .splitter-layout.layout-changing {
      cursor: col-resize;
    }

    .splitter-layout.layout-changing > .layout-splitter {
      background-color: #aaa;
    }

    .splitter-layout.splitter-layout-vertical {
      flex-direction: column;
    }

    .splitter-layout.splitter-layout-vertical.layout-changing {
      cursor: row-resize;
    }

    .splitter-layout.splitter-layout-vertical > .layout-splitter {
      width: 100%;
      height: 4px;
      cursor: row-resize;
    }
  `
);
