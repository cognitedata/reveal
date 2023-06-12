import React, { DragEvent, useRef, useEffect, useState, useId } from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { zIndex } from '@data-exploration-lib/core';

type Props = {
  children?: React.ReactNode;
  showFilter?: boolean;
  isFullpage?: boolean;
  showOverlay?: boolean;
};

// TODO: better names and structure?
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
        resizable!.style.marginLeft = `-302px`;
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
        resizable!.style.marginLeft = `-302px`;
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

  const handleOnDrag = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    if (e.clientX > 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      setInitialPos(e.clientX);
      if (initialPos) {
        setInitialWidth(window.innerWidth - initialPos);

        const resizable = document.getElementById(resizableId);
        resizable!.style.width = `${window.innerWidth - initialPos}px`; //?
        resizable!.style.top = rect.y + 'px'; //?
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
        <DragAreaWrapper>
          <ButtonWrapper
            draggable="true"
            onDragStart={(e: DragEvent) => {
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDrag={handleOnDrag}
            onDragOver={(e: DragEvent) => {
              e.preventDefault();
            }}
          >
            <Button type="secondary" icon="DragHandleVertical" />
          </ButtonWrapper>
        </DragAreaWrapper>
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
  min-width: 600px;
  /* background-color: rgba(120, 120, 120, 0.3); */
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
`;

export const ButtonWrapper = styled.div`
  position: absolute;
  margin-left: -8px;
  background-color: transparent;
  border-radius: 4px;
  z-index: ${zIndex.MAXIMUM};

  .cogs.cogs-button {
    /* padding: 10px 2px; */
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
  /* background-color: rgba(120, 120, 120, 0.3); */
  overflow: auto;
`;

export const ContentFlexWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
