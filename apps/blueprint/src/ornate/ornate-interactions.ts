import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import clamp from 'lodash/clamp';

import { CogniteOrnate } from './ornate';
import { getInputTypeFromWheelEvent, WheelEventInputType } from './utils';

const RIGHT_MOUSE_BUTTON = 2;

export class OrnateInteractions {
  private instance: CogniteOrnate;
  private stage: Konva.Stage;
  constructor(instance: CogniteOrnate) {
    this.instance = instance;
    this.stage = instance.stage;

    this.stage.on('mousedown', this.onStageMouseDown);
    this.stage.on('mousemove', this.onStageMouseMove);
    this.stage.on('mouseup', this.onStageMouseUp);
    this.stage.on('wheel', this.onStageMouseWheel);
    this.stage.on('mouseover', this.onStageMouseOver);
    this.stage.on('contextmenu', this.onStageContextMenu);
    this.stage.on('mouseenter', this.onStageMouseEnter);
  }
  onStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === RIGHT_MOUSE_BUTTON) {
      this.stage.startDrag();
      return;
    }

    if (this.instance.activeTool?.onMouseDown) {
      this.instance.activeTool.onMouseDown(e);
    }
  };

  onStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    this.setCursor(
      e.target.eventListeners.click === undefined &&
        e.target.eventListeners.dblclick === undefined
        ? this.instance.activeTool?.cursor || 'default'
        : 'pointer'
    );

    if (this.instance.activeTool?.onMouseMove) {
      this.instance.activeTool.onMouseMove(e);
    }
  };

  onStageMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === RIGHT_MOUSE_BUTTON) {
      this.stage.stopDrag();
      return;
    }

    if (this.instance.activeTool?.onMouseUp) {
      this.instance.activeTool.onMouseUp(e);
    }
  };

  onStageMouseOver = (e: KonvaEventObject<MouseEvent>) => {
    if (this.instance.activeTool?.onMouseOver) {
      this.instance.activeTool.onMouseOver(e);
    }
  };

  onStageMouseWheel = (
    e: KonvaEventObject<WheelEvent & { wheelDeltaY?: number }>
  ) => {
    e.evt.preventDefault();
    const {
      MOUSE_WHEEL_SCALE_FACTOR,
      TOUCHPAD_PAN_DELTA_MAX,
      TOUCHPAD_PAN_FACTOR,
      TOUCHPAD_SCALE_FACTOR,
    } = this.instance.constants;
    const inputType = getInputTypeFromWheelEvent(e.evt);
    if (
      e.evt.ctrlKey ||
      inputType === WheelEventInputType.MOUSE_WHEEL ||
      inputType === WheelEventInputType.TOUCHPAD_PINCH_TO_ZOOM
    ) {
      const scaleFactor =
        inputType === WheelEventInputType.MOUSE_WHEEL
          ? MOUSE_WHEEL_SCALE_FACTOR
          : TOUCHPAD_SCALE_FACTOR;
      this.onZoom(scaleFactor * e.evt.deltaY, true);
      return;
    }

    const dx = clamp(
      TOUCHPAD_PAN_FACTOR * e.evt.deltaX,
      -TOUCHPAD_PAN_DELTA_MAX,
      TOUCHPAD_PAN_DELTA_MAX
    );
    const dy = clamp(
      TOUCHPAD_PAN_FACTOR * e.evt.deltaY,
      -TOUCHPAD_PAN_DELTA_MAX,
      TOUCHPAD_PAN_DELTA_MAX
    );

    const x = this.stage.x() - dx;
    const y = this.stage.y() - dy;

    this.stage.x(x);
    this.stage.y(y);
  };

  onStageContextMenu = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
  };

  onStageMouseEnter = () => {
    this.instance.host.style.cursor =
      this.instance.activeTool?.cursor || 'pointer';

    if (this.stage.isDragging()) {
      this.stage.stopDrag();
    }
  };

  onZoom = (scale: number, pointer: boolean) => {
    const oldScale = this.stage.scale();
    let referencePoint = null;
    const { SCALE_MAX, SCALE_MIN, SCALE_DELTA_MAX } = this.instance.constants;
    if (pointer) {
      referencePoint = this.stage.getPointerPosition();
    } else {
      referencePoint = {
        x: this.stage.container().clientWidth / 2,
        y: this.stage.container().clientHeight / 2,
      } as Vector2d;
    }

    if (!referencePoint) {
      return;
    }

    const referencePointTo = {
      x: (referencePoint.x - this.stage.x()) / oldScale.x,
      y: (referencePoint.y - this.stage.y()) / oldScale.y,
    };

    // example: oldScale.x = 1, clampedScale = 0.1 => newScale.x = 1.1
    // example: oldScale.x = 0.1, clampedScale = 0.1 => newScale.x = 0.11
    const clampedScale = clamp(scale, -SCALE_DELTA_MAX, SCALE_DELTA_MAX);

    const newScale = {
      x: oldScale.x * (1 + clampedScale),
      y: oldScale.y * (1 + clampedScale),
    };

    if (
      newScale.x < SCALE_MIN ||
      newScale.y < SCALE_MIN ||
      newScale.x > SCALE_MAX ||
      newScale.y > SCALE_MAX
    ) {
      return;
    }

    this.stage.scale({ x: newScale.x, y: newScale.y });

    const newPos = {
      x: referencePoint.x - referencePointTo.x * newScale.x,
      y: referencePoint.y - referencePointTo.y * newScale.y,
    };

    this.stage.position(newPos);
  };

  setCursor = (cursor: string): void => {
    this.stage.container().style.cursor = cursor;
  };
}
