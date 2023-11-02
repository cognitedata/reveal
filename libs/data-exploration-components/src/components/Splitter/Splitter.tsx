import React from 'react';
import SplitterLayout from 'react-splitter-layout';

import styled, { css } from 'styled-components';

import { SIDEBAR_RESIZE_EVENT, zIndex } from '@data-exploration-lib/core';

import handleSvg from './handle';

// Create the CSS content URL from the SVG code
const cssContentUrl = `url("data:image/svg+xml,${encodeURIComponent(
  handleSvg
)}")`;

export type SplitterProps = {
  secondaryMinSize?: number;
  primaryMinSize?: number;
  percentage?: boolean;
  primaryIndex?: 0 | 1;
  onSecondaryPaneSizeChange?: (value: number) => void;
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  secondaryInitialSize?: number;
};

export const Splitter = ({
  children,
  secondaryMinSize = 360,
  percentage = false,
  primaryMinSize,
  primaryIndex = 0,
  secondaryInitialSize,
  onSecondaryPaneSizeChange,
  className,
}: SplitterProps) => (
  <SplitterWrapper className={className}>
    <SplitterLayout
      secondaryMinSize={secondaryMinSize}
      secondaryInitialSize={
        Number.isFinite(secondaryInitialSize)
          ? secondaryInitialSize
          : secondaryMinSize
      }
      primaryIndex={primaryIndex}
      primaryMinSize={primaryMinSize}
      onDragEnd={() => {
        window.dispatchEvent(new Event(SIDEBAR_RESIZE_EVENT));
      }}
      percentage={percentage}
      onSecondaryPaneSizeChange={onSecondaryPaneSizeChange}
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
      width: 100%;
      height: 100%;
    }

    .splitter-layout > .layout-splitter {
      flex: 0 0 auto;
      width: 4px;
      height: 100%;
      cursor: col-resize;
      transition: 0.3s all;
      position: relative;
      border-left: solid 1px var(--cogs-border--muted);
    }

    .splitter-layout > .layout-splitter::before {
      content: ${cssContentUrl};
      position: absolute;
      isolation: isolate;
      z-index: ${zIndex.MINIMUM};
      top: 50%;
      left: -6px;
      width: 12px;
      height: 36px;
    }

    .splitter-layout.layout-changing {
      cursor: col-resize;
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
