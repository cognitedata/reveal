/*!
 * Copyright 2023 Cognite AS
 */

import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { type ReactElement, useState, type ReactNode, useEffect, type SyntheticEvent } from 'react';
import Widget from './Widget';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { ResizableBox, type ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import {
  WIDGET_HEIGHT_FACTOR,
  WIDGET_INSIDE_WINDOW_MIN_HEIGHT,
  WIDGET_WIDTH_FACTOR,
  WIDGET_WINDOW_MIN_HEIGHT,
  WIDGET_WINDOW_MIN_WIDTH,
  WIDGET_WINDOW_X_OFFSET,
  WIDGET_WINDOW_Y_OFFSET
} from './constants';
import { useTranslation } from '../i18n/I18n';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { StyledComponent, WidgetBody, WidgetContent } from './elements';
import { useReveal } from '../RevealCanvas/ViewerContext';

type WindowWidgetProps = {
  title?: string;
  subtitle?: string;
  header?: string;
  type?: string;
  headerElement?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  onResize?: (width: number, height: number) => void;
};

export const WindowWidget = ({
  title,
  subtitle,
  header,
  type,
  children,
  headerElement,
  onClose,
  onResize
}: WindowWidgetProps): ReactElement => {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const viewer = useReveal();
  const parentContainerElement = viewer.domElement;

  const size = useParentResize(parentContainerElement, isMinimized, onResize);

  if (parentContainerElement === undefined) {
    return <></>;
  }

  const handleExpand = (): void => {
    if (!isMinimized) {
      setPosition({ x: 0, y: 0 });
    }
    setIsMinimized((prev) => !prev);
  };

  const handleClose = (): void => {
    onClose?.();
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

  const handleResize = (_event: SyntheticEvent, data: ResizeCallbackData): void => {
    const { size } = data;
    onResize?.(size.width, size.height);
  };

  return (
    <WidgetComponent
      isMinimized={isMinimized}
      style={
        isMinimized
          ? {
              position: 'absolute',
              right: '10px'
            }
          : {}
      }>
      <Draggable onDrag={handleDrag} position={position} handle=".widget-header">
        <ResizableBox
          width={size.width}
          height={size.height}
          minConstraints={[WIDGET_WINDOW_MIN_WIDTH, WIDGET_INSIDE_WINDOW_MIN_HEIGHT]}
          maxConstraints={[parentContainerElement.clientWidth, parentContainerElement.clientHeight]}
          resizeHandles={isMinimized ? [] : ['se', 'ne', 'e', 's']}
          onResize={handleResize}>
          <Widget>
            <Widget.Header title={title} type={type} header={header} subtitle={subtitle}>
              {headerElement !== undefined && headerElement}
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

const useParentResize = (
  parentContainerElement: HTMLElement | undefined,
  isMinimized: boolean,
  onResize?: (width: number, height: number) => void
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

      onResize?.(width, height);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(parentContainerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMinimized, parentContainerElement]);

  return size;
};

const WidgetComponent = withSuppressRevealEvents(StyledComponent);
