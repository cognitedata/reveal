/*!
 * Copyright 2025 Cognite AS
 */
import { signal, type Signal } from '@cognite/signals';
import { type DraggableData, type DraggableEvent } from 'react-draggable';
import { Vector2 } from 'three';
import {
  WIDGET_HEIGHT_FACTOR,
  WIDGET_WIDTH_FACTOR,
  WIDGET_WINDOW_MIN_HEIGHT,
  WIDGET_WINDOW_MIN_WIDTH,
  WIDGET_WINDOW_X_OFFSET,
  WIDGET_WINDOW_Y_OFFSET
} from './constants';
import { type Disposable } from '../../utilities/mvvm';

export type OnResizeCallback = (width: number, height: number) => void;

export class WindowWidgetModel implements Disposable {
  private readonly _isMinimized = signal(false);
  private readonly _position = signal(new Vector2(0, 0));
  private readonly _size = signal(new Vector2(0, 0));
  private readonly _parentContainerSignal: Signal<HTMLElement | undefined>;
  private readonly _onResizeSignal: Signal<OnResizeCallback | undefined>;
  private readonly _resizeObserver: ResizeObserver | undefined;

  constructor(
    parentContainerSignal: Signal<HTMLElement | undefined>,
    onResizeSignal: Signal<OnResizeCallback | undefined>
  ) {
    this._parentContainerSignal = parentContainerSignal;
    this._onResizeSignal = onResizeSignal;

    this.registerResizeHandler();
  }

  get isMinimized(): Signal<boolean> {
    return this._isMinimized;
  }

  get position(): Signal<Vector2> {
    return this._position;
  }

  get size(): Signal<Vector2> {
    return this._size;
  }

  handleDrag(event: DraggableEvent, data: DraggableData): void {
    const parentContainer = this._parentContainerSignal();
    if (parentContainer === undefined) {
      return;
    }

    event.stopPropagation();

    const { x, y, node } = data;
    const { left, top, width } = node.getBoundingClientRect();
    const {
      width: parentWidth,
      height: parentHeight,
      left: parentLeft,
      top: parentTop
    } = parentContainer.getBoundingClientRect();

    if (
      left + width - WIDGET_WINDOW_X_OFFSET < parentLeft ||
      top < parentTop ||
      left + WIDGET_WINDOW_X_OFFSET > parentLeft + parentWidth ||
      top + WIDGET_WINDOW_Y_OFFSET > parentTop + parentHeight
    ) {
      return;
    }

    this.position(new Vector2(x, y));
  }

  private unregisterResizeHandler(): void {
    this._resizeObserver?.disconnect();
  }

  private registerResizeHandler(): void {
    const parentContainer = this._parentContainerSignal();
    if (parentContainer === undefined) {
      return;
    }

    const parentWidth = parentContainer.clientWidth;
    const parentHeight = parentContainer.clientHeight;

    const width = this.isMinimized() ? WIDGET_WINDOW_MIN_WIDTH : parentWidth * WIDGET_WIDTH_FACTOR;
    const height = this.isMinimized()
      ? WIDGET_WINDOW_MIN_HEIGHT
      : parentHeight * WIDGET_HEIGHT_FACTOR;
    this.size(new Vector2(width, height));

    this._onResizeSignal()?.(width, height);
  }

  dispose(): void {
    this.unregisterResizeHandler();
  }
}
