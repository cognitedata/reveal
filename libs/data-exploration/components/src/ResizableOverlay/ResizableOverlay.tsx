import React, { useRef, useEffect, useState, useId } from 'react';
import { DraggableCore, DraggableEvent } from 'react-draggable';

import styled from 'styled-components';

import { PREVIEW_SIDEBAR_MIN_WIDTH, zIndex } from '@data-exploration-lib/core';

import handleSvg from './handle';

// Create the CSS content URL from the SVG code
const cssContentUrl = `url("data:image/svg+xml,${encodeURIComponent(
  handleSvg
)}")`;

const SEARCH_FILTER_WIDTH = 302;

type Props = {
  children?: React.ReactNode;
  showFilter?: boolean;
  isFullpage?: boolean;
  showOverlay?: boolean;
};

export const ResizableOverlay = ({
  children,
  showFilter = true,
  isFullpage = false,
  showOverlay = true,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const resizableId = useId();

  // Initial position of drag button
  const [initialPos, setInitialPos] = useState<number>(0);
  // Initial width of overlay
  const [initialWidth, setInitialWidth] = useState<number>(0);

  useEffect(() => {
    setInitialWidth(ref.current!.clientWidth);
  }, []);

  useEffect(() => {
    const resizable = document.getElementById(resizableId);
    // full-page mode
    if (isFullpage) {
      resizable!.style.width = `${window.innerWidth}px`;
      if (showFilter) {
        // This is safe to do when we are in full-page mode.
        resizable!.style.marginLeft = `-${SEARCH_FILTER_WIDTH}px`;
      }
    } else {
      if (initialWidth === 0) {
        // if opening initially, i.e. there is no width setted before,
        // start from the default initial width percentage.
        resizable!.style.width = `60%`;
      } else {
        resizable!.style.width = `${initialWidth}px`; // remember the last set width here.
      }

      if (initialPos > 1 && initialPos <= 360 && showFilter) {
        resizable!.style.marginLeft = `-${SEARCH_FILTER_WIDTH}px`;
      } else {
        resizable!.style.marginLeft = `0`;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullpage, resizableId, showFilter, initialWidth]);

  // Listening for the window resize event
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);

    // Cleanup, remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullpage]);

  const handleWindowResize = () => {
    const resizable = document.getElementById(resizableId);
    if (isFullpage) {
      resizable!.style.width = `${window.innerWidth}px`;
    }
  };

  const handleDrag = (e: DraggableEvent) => {
    const mouseEvent = e as MouseEvent;

    if (mouseEvent.clientX > 1) {
      setInitialPos(mouseEvent.clientX);
      if (initialPos) {
        setInitialWidth(window.innerWidth - mouseEvent.clientX);

        const resizable = document.getElementById(resizableId);
        resizable!.style.width = `${window.innerWidth - mouseEvent.clientX}px`;
      }
    }
  };

  return (
    <DetailsOverlayWrapper
      ref={ref}
      id={resizableId}
      fullPage={isFullpage}
      showFilter={showFilter}
      showOverlay={showOverlay}
    >
      {!isFullpage && (
        <DraggableCore
          onStart={(e: DraggableEvent) => {
            // This helps to prevent weird scroll behavior when dragged to left immediately.
            e.preventDefault();
          }}
          onDrag={handleDrag}
        >
          <DragAreaWrapper>
            <div className="splitter" />
          </DragAreaWrapper>
        </DraggableCore>
      )}

      <OverlayContentWrapper>
        <ContentFlexWrapper>{children}</ContentFlexWrapper>
      </OverlayContentWrapper>
    </DetailsOverlayWrapper>
  );
};

interface DetailsOverlayWrapperProps {
  fullPage: boolean;
  showFilter: boolean;
  showOverlay: boolean;
}

export const DetailsOverlayWrapper = styled.div<DetailsOverlayWrapperProps>`
  height: 100%;
  width: 60%;
  min-width: ${PREVIEW_SIDEBAR_MIN_WIDTH}px;
  background-color: var(--cogs-surface--muted);
  display: ${(props) => (props.showOverlay ? 'flex' : 'none')};
  z-index: ${zIndex.MAXIMUM};
`;

export const DragAreaWrapper = styled.div`
  height: 100%;
  width: 1px;
  background: var(--cogs-border--muted);
  display: flex;
  align-items: center;

  &:hover {
    cursor: col-resize;
  }

  > .splitter {
    flex: 0 0 auto;
    width: 4px;
    height: 100%;
    cursor: col-resize;
    transition: 0.3s all;
    position: relative;
    border-left: solid 1px var(--cogs-border--muted);
  }

  & > .splitter::before {
    content: ${cssContentUrl};
    position: absolute;
    isolation: isolate;
    top: 50%;
    left: -6px;
    width: 12px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cogs-surface--strong);
    color: var(--cogs-border--muted);
    border: 1px solid var(--cogs-border--muted);
    border-radius: 4px;
    z-index: ${zIndex.MINIMUM};
  }
`;

export const ButtonWrapper = styled.div`
  position: absolute;
  margin-left: -8px;
  background-color: transparent;
  border-radius: 4px;
  z-index: ${zIndex.MAXIMUM};

  .cogs.cogs-button {
    padding: 8px 0;
    background-color: var(--cogs-surface--strong);
    border-radius: 4px;
    border: 1px solid var(--cogs-border--muted);

    &:hover {
      cursor: col-resize;
    }
  }
`;

export const OverlayContentWrapper = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
`;

export const ContentFlexWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
