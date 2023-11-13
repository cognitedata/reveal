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

type SplitWidgetProps = {
  title?: string;
  subtitle?: string;
  header?: string;
  type?: string;
  children: ReactNode;
};

export const SplitWidget = ({
  title,
  subtitle,
  header,
  type,
  children
}: SplitWidgetProps): ReactElement => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const parentContainerElement = useRevealContainerElement();

  if (parentContainerElement === undefined) {
    return <></>;
  }

  useEffect(() => {
    const updateSize = (): void => {
      const parentWidth = parentContainerElement.clientWidth;
      const parentHeight = parentContainerElement.clientHeight;

      const width = isMinimized ? 300 : parentWidth * 0.6;
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

  const handleDrag = (event: DraggableEvent, data: DraggableData): void => {
    event.stopPropagation();

    const { x, y, node } = data;
    const { left, top, width } = node.getBoundingClientRect();
    const {
      width: parentWidth,
      height: parentHeight,
      left: parentLeft,
      top: parentTop
    } = parentContainerElement.getBoundingClientRect();

    const xOffset = 150;
    const yOffset = 75;

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
          resizeHandles={isMinimized ? [] : ['se']}
          onResize={(_event, { size }) => {
            setSize(size);
          }}>
          <Widget>
            <Widget.Header title={title} type={type} header={header} subtitle={subtitle}>
              <Button
                type="ghost"
                icon={isMinimized ? 'Expand' : 'Collapse'}
                onClick={handleExpand}
              />
              <Button type="ghost" icon="Close" />
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
  left: ${({ isMinimized }) => (isMinimized ? 'calc(75% - 20px)' : 'calc(40% - 20px)')};
  top: 50px;
  width: ${({ isMinimized }) => (isMinimized ? '300px' : '100%')};
  height: auto;
  min-width: 20%;
  min-height: 10%;
  max-width: ${({ isMinimized }) => (isMinimized ? '300px' : '100%')};
`;
