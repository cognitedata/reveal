/*!
 * Copyright 2023 Cognite AS
 */

import {
  Button,
  CloseIcon,
  Tooltip as CogsTooltip,
  CollapseIcon,
  ExpandIcon
} from '@cognite/cogs.js';
import { type ReactElement, type ReactNode } from 'react';
import Widget from './Widget';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { WIDGET_INSIDE_WINDOW_MIN_HEIGHT, WIDGET_WINDOW_MIN_WIDTH } from './constants';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { StyledComponent, WidgetBody, WidgetContent } from './elements';
import { useWindowWidgetProperties } from './WindowWidget.viewmodel';

export type WindowWidgetProps = {
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
  const {
    isMinimized,
    handleDrag,
    position,
    size,
    handleResize,
    expandTooltip,
    handleExpand,
    handleClose,
    parentSize,
    closeTooltip,
    enable
  } = useWindowWidgetProperties({ onResize, onClose });

  if (!enable) {
    return <></>;
  }

  const ExpandCollapseIcon = isMinimized ? <ExpandIcon /> : <CollapseIcon />;

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
          maxConstraints={[parentSize.x, parentSize.y]}
          resizeHandles={isMinimized ? [] : ['se', 'ne', 'e', 's']}
          onResize={handleResize}>
          <Widget>
            <Widget.Header title={title} type={type} header={header} subtitle={subtitle}>
              {headerElement !== undefined && headerElement}
              <CogsTooltip content={expandTooltip} placement="top">
                <Button type="ghost" icon={ExpandCollapseIcon} onClick={handleExpand} />
              </CogsTooltip>
              <CogsTooltip content={closeTooltip} placement="top">
                <Button type="ghost" icon=<CloseIcon /> onClick={handleClose} />
              </CogsTooltip>
            </Widget.Header>
            <WidgetBody>{!isMinimized && <WidgetContent>{children}</WidgetContent>}</WidgetBody>
          </Widget>
        </ResizableBox>
      </Draggable>
    </WidgetComponent>
  );
};

const WidgetComponent = withSuppressRevealEvents(StyledComponent);
