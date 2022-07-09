/* eslint-disable no-unsafe-optional-chaining */
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';

import { defaultColor } from '../../utils/colors';
import { Rect } from '../../shapes';
import { CogniteOrnate } from '../../ornate';
import { Tool, ToolNodeStyle, ToolType } from '..';

export class RectTool implements Tool {
  cursor = 'crosshair';
  newRect: Rect | null = null;
  ornate: CogniteOrnate;
  name: ToolType = 'RECT';
  isDrawing = false;
  style?: ToolNodeStyle | undefined;
  constructor(instance: CogniteOrnate) {
    this.ornate = instance;
  }

  onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    this.isDrawing = true;

    // If we're over an item with a group attachment, add it there instead.
    const groupId =
      e.target.attrs?.type === 'GROUP' ? e.target.id() : undefined;
    const group = groupId
      ? this.ornate.stage.findOne<Konva.Group>(`#${groupId}`)
      : undefined;

    const translatedMousePosition =
      this.ornate.stage.getRelativePointerPosition();
    this.newRect = new Rect({
      id: uuid(),
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      width: 1,
      height: 1,
      userGenerated: true,
      name: 'drawing',
      fill: this.ornate.style?.fill || defaultColor.hex(),
      stroke: this.ornate.style?.stroke || 'rgba(0, 0, 0, 1)',
      strokeWidth: this.style?.strokeWidth || 8,
      groupId: group?.id(),
      source: 'RectTool',
    });

    // If we get scaled by the transform tool - correct ourselves.
    this.newRect.shape.on('transformend', () => {
      if (this.newRect) {
        this.newRect.shape.width(
          this.newRect.shape?.width() * this.newRect.shape?.scaleX()
        );
        this.newRect.shape.scaleX(1);

        this.newRect.shape.height(
          this.newRect.shape?.height() * this.newRect.shape?.scaleY()
        );
        this.newRect.shape.scaleY(1);
      }
    });
    this.ornate.addShape([this.newRect]);
  };

  onMouseMove = () => {
    if (!this.newRect) {
      return;
    }
    if (this.isDrawing) {
      const translatedMousePosition =
        this.ornate.stage.getRelativePointerPosition();
      this.newRect.shape.width(
        translatedMousePosition.x - this.newRect.shape.x()
      );
      this.newRect.shape.height(
        translatedMousePosition.y - this.newRect.shape.y()
      );
    }
  };

  onMouseUp = () => {
    this.isDrawing = false;
    this.ornate.emitSaveEvent();
  };
}
