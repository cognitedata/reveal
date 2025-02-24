/*!
 * Copyright 2025 Cognite AS
 */
import { type SyntheticEvent, useCallback, useContext, useMemo } from 'react';
import { type DraggableData, type DraggableEvent } from 'react-draggable';
import { type ResizeCallbackData } from 'react-resizable';
import { WindowWidgetContext, type WindowWidgetProperties } from './WindowWidget.context';
import { Vector2 } from 'three';
import { useSignalValue } from '@cognite/signals/react';
import { useValueAsSignal } from '../../utilities/signals/useValueAsSignal';
import { useDispatchableModel } from '../../utilities/mvvm';

export type WindowWidgetViewProperties = {
  isMinimized: boolean;
  size: Vector2;
  position: Vector2;
  parentSize: Vector2;
  handleDrag?: (event: DraggableEvent, data: DraggableData) => void;
  handleResize?: (event: SyntheticEvent, data: ResizeCallbackData) => void;
  handleClose?: () => void;
  expandTooltip: string;
  handleExpand: () => void;
  closeTooltip?: string;
  enable: boolean;
};

export function useWindowWidgetProperties({
  onResize,
  onClose
}: {
  onResize?: (width: number, height: number) => void;
  onClose?: () => void;
}): WindowWidgetViewProperties {
  const { WindowWidgetModel, hooks } = useContext<WindowWidgetProperties>(WindowWidgetContext);

  const { t } = hooks.useTranslation();

  const viewer = hooks.useReveal();
  const parentContainerElement = viewer.domElement;

  const parentContainerElementSignal = useValueAsSignal<HTMLElement | undefined>(
    parentContainerElement
  );

  const onResizeCallbackSignal = useValueAsSignal(onResize);

  const widgetModel = useDispatchableModel(
    WindowWidgetModel,
    parentContainerElementSignal,
    onResizeCallbackSignal
  );

  const position = useSignalValue(widgetModel.position);
  const isMinimized = useSignalValue(widgetModel.isMinimized);
  const size = useSignalValue(widgetModel.size);

  const handleResize = useCallback(
    (_event: SyntheticEvent, data: ResizeCallbackData): void => {
      const { size } = data;
      onResize?.(size.width, size.height);
    },
    [onResize]
  );

  const expandTooltip = useMemo(
    () => (isMinimized ? t({ key: 'WIDGET_WINDOW_EXPAND' }) : t({ key: 'WIDGET_WINDOW_MINIMIZE' })),
    [widgetModel.isMinimized(), t]
  );

  const closeTooltip = useMemo(() => t({ key: 'WIDGET_WINDOW_CLOSE' }), [t]);

  const handleExpand = (): void => {
    if (!widgetModel.isMinimized()) {
      widgetModel.position(new Vector2(0, 0));
    }
    widgetModel.isMinimized(!isMinimized);
  };

  const handleClose = (): void => {
    onClose?.();
  };

  return {
    isMinimized,
    size,
    position,
    handleClose,
    handleDrag: (event, data) => {
      widgetModel.handleDrag(event, data);
    },
    handleResize,
    expandTooltip,
    handleExpand,
    enable: parentContainerElement !== undefined,
    parentSize: useMemo(
      () => new Vector2(parentContainerElement.clientWidth, parentContainerElement.clientHeight),
      [parentContainerElement]
    ),
    closeTooltip
  };
}
