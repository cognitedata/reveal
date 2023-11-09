/*!
 * Copyright 2023 Cognite AS
 */

import { Button } from '@cognite/cogs.js';
import { type ReactElement, useState, type ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import Widget from './Widget';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { useRevealContainerElement } from '../RevealContainer/RevealContainerElementContext';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

type PreviewWidgetProps = {
  children?: ReactNode;
};

export const PreviewWidget = ({ children }: PreviewWidgetProps): ReactElement => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setOpen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerElement = useRevealContainerElement();

  if (containerElement === undefined) {
    return <></>;
  }

  useEffect(() => {
    const updateSize = (): void => {
      const parentWidth = containerElement.clientWidth;
      const parentHeight = containerElement.clientHeight;

      const width = isMinimized ? 300 : parentWidth * 0.4;
      const height = isMinimized ? 48 : parentHeight * 0.8;

      setSize({ width, height });
    };

    updateSize();

    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [isMinimized]);

  const handleExpand = (): void => {
    setIsMinimized((prev) => !prev);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleDrag = (event: DraggableEvent, data: DraggableData): void => {
    event.stopPropagation();

    const { x, y, node } = data;
    const { left, top, width } = node.getBoundingClientRect();
    const {
      width: parentWidth,
      height: parentHeight,
      left: parentLeft,
      top: parentTop
    } = containerElement.getBoundingClientRect();

    const xOffset = 150;
    const yOffset = 50;

    if (
      left + width - xOffset < parentLeft ||
      top < parentTop ||
      left + xOffset > parentWidth ||
      top + yOffset > parentHeight
    ) {
      // Prevent moving beyond the canvas
      return;
    }

    setPosition({ x, y });
  };

  return (
    <StyledComponent isMinimized={isMinimized}>
      <Draggable onDrag={handleDrag} position={position} handle=".widget-header">
        <ResizableBox
          width={size.width}
          height={size.height}
          resizeHandles={isMinimized ? [] : ['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}
          onResize={(_event, { size }) => {
            setSize(size);
          }}>
          <Widget isMinimized={isMinimized}>
            <Widget.Header
              title="Widget component"
              type="3D"
              header="Test Header"
              subtitle="Test subtitle">
              <Button
                type="ghost"
                icon={isMinimized ? 'Expand' : 'Collapse'}
                onClick={handleExpand}
              />
              <Button type="ghost" icon="Close" onClick={handleClose} />
            </Widget.Header>

            <Widget.Body>{!isMinimized && <WidgetContent>{children}</WidgetContent>}</Widget.Body>
          </Widget>
        </ResizableBox>
      </Draggable>
    </StyledComponent>
  );
};

const WidgetContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 0px 10px 10px 10px;
`;

const StyledComponent = styled.div<{ isMinimized: boolean }>`
  position: absolute;
  left: ${({ isMinimized }) => (isMinimized ? 'calc(80% - 20px)' : 'calc(40% - 20px)')};
  top: 50px;
  width: ${({ isMinimized }) => (isMinimized ? '300px' : '100%')};
  height: auto;
  min-width: 20%;
  min-height: 10%;
  max-width: ${({ isMinimized }) => (isMinimized ? '300px' : '100%')};
`;
