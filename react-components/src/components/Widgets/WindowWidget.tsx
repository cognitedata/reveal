/*!
 * Copyright 2023 Cognite AS
 */

import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { type ReactElement, useState, type ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import Widget from './Widget';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { useRevealContainerElement } from '../RevealContainer/RevealContainerElementContext';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import {
  WIDGET_HEIGHT_FACTOR,
  WIDGET_WIDTH_FACTOR,
  WIDGET_WINDOW_MIN_HEIGHT,
  WIDGET_WINDOW_MIN_WIDTH,
  WIDGET_WINDOW_X_OFFSET,
  WIDGET_WINDOW_Y_OFFSET
} from './constants';
import { useTranslation } from '../i18n/I18n';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';

type WindowWidgetProps = {
  title?: string;
  subtitle?: string;
  header?: string;
  type?: string;
  children: ReactNode;
  onClose?: () => void;
};

export const WindowWidget = ({
  title,
  subtitle,
  header,
  type,
  children,
  onClose
}: WindowWidgetProps): ReactElement => {
  const { t } = useTranslation();
  const [isShown, setIsShown] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const parentContainerElement = useRevealContainerElement();

  const size = useResize(parentContainerElement, isMinimized);

  if (parentContainerElement === undefined || !isShown) {
    return <></>;
  }

  const handleExpand = (): void => {
    setIsMinimized((prev) => !prev);
  };

  const handleClose = (): void => {
    if (onClose !== undefined) {
      onClose();
    }
    setIsShown(false);
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

    if (
      left + width - WIDGET_WINDOW_X_OFFSET < parentLeft ||
      top < parentTop ||
      left + WIDGET_WINDOW_X_OFFSET > parentLeft + parentWidth ||
      top + WIDGET_WINDOW_Y_OFFSET > parentTop + parentHeight
    ) {
      // Prevent moving beyond the canvas
      return;
    }

    setPosition({ x, y });
  };

  return (
    <WidgetComponent
      isMinimized={isMinimized}
      style={
        isMinimized
          ? {
              position: 'absolute',
              left: `${
                parentContainerElement !== null && parentContainerElement !== undefined
                  ? parentContainerElement.clientWidth * 0.75 - 20
                  : 0
              }px`,
              top: '50px'
            }
          : {}
      }>
      <Draggable
        onDrag={handleDrag}
        position={isMinimized ? { x: 0, y: 0 } : position}
        handle=".widget-header"
        disabled={isMinimized}>
        <ResizableBox
          width={size.width}
          height={size.height}
          resizeHandles={isMinimized ? [] : ['se']}>
          <Widget>
            <Widget.Header title={title} type={type} header={header} subtitle={subtitle}>
              <CogsTooltip
                content={
                  isMinimized
                    ? t('WIDGET_WINDOW_EXPAND', 'Expand')
                    : t('WIDGET_WINDOW_MINIMIZE', 'Minimize')
                }
                placement="top"
                appendTo={document.body}>
                <Button
                  type="ghost"
                  icon={isMinimized ? 'Expand' : 'Collapse'}
                  onClick={handleExpand}
                />
              </CogsTooltip>
              <CogsTooltip
                content={t('WIDGET_WINDOW_CLOSE', 'Close')}
                placement="top"
                appendTo={document.body}>
                <Button type="ghost" icon="Close" onClick={handleClose} />
              </CogsTooltip>
            </Widget.Header>
            <WidgetBody>{!isMinimized && <WidgetContent>{children}</WidgetContent>}</WidgetBody>
          </Widget>
        </ResizableBox>
      </Draggable>
    </WidgetComponent>
  );
};

const useResize = (
  parentContainerElement: HTMLElement | undefined,
  isMinimized: boolean
): {
  width: number;
  height: number;
} => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (parentContainerElement === undefined) {
      return;
    }
    const updateSize = (): void => {
      const parentWidth = parentContainerElement.clientWidth;
      const parentHeight = parentContainerElement.clientHeight;

      const width = isMinimized ? WIDGET_WINDOW_MIN_WIDTH : parentWidth * WIDGET_WIDTH_FACTOR;
      const height = isMinimized ? WIDGET_WINDOW_MIN_HEIGHT : parentHeight * WIDGET_HEIGHT_FACTOR;

      setSize({ width, height });
    };

    updateSize();

    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [isMinimized, parentContainerElement]);

  return size;
};

const WidgetContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 0px 10px 10px 10px;
`;

const WidgetBody = styled.div`
  height: 100%;
  overflow: auto;
`;

const StyledComponent = styled.div<{ isMinimized: boolean }>`
  position: absolute;
  left: ${({ isMinimized }) => (isMinimized ? '0px' : 'calc(60% - 20px)')};
  top: 50px;
  width: ${({ isMinimized }) => (isMinimized ? '300px' : '100%')};
  height: auto;
  min-width: 20%;
  min-height: 10%;
  max-width: ${({ isMinimized }) => (isMinimized ? '300px' : '100%')};
  box-shadow:
    0px 1px 1px 1px rgba(79, 82, 104, 0.06),
    0px 1px 2px 1px rgba(79, 82, 104, 0.04);
`;

const WidgetComponent = withSuppressRevealEvents(StyledComponent);
