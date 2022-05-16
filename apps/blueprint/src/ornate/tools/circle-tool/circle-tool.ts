/* eslint-disable no-unsafe-optional-chaining */
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';

import { defaultColor } from '../../utils/colors';
import { CogniteOrnate } from '../../ornate';
import { Circle } from '../../shapes';
import { Tool, ToolNodeStyle, ToolType } from '..';

export class CircleTool implements Tool {
  cursor = 'crosshair';
  name: ToolType = 'CIRCLE';
  newCircle: Circle | null = null;
  group: Konva.Group | null = null;
  ornate: CogniteOrnate;
  isDrawing = false;
  style?: ToolNodeStyle | undefined;

  constructor(instance: CogniteOrnate) {
    this.ornate = instance;
  }

  onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    this.isDrawing = true;
    // If we're over an item with a group attachment, add it there instead.
    const groupId = e.target.attrs?.groupId;

    this.group = this.ornate.stage.findOne(`#${groupId}`) as Konva.Group;

    const { x, y } = this.ornate.stage.getRelativePointerPosition();
    this.newCircle = new Circle({
      id: uuid(),
      x,
      y,
      width: 1,
      height: 1,
      userGenerated: true,
      type: 'CIRCLE',
      name: 'drawing',
      fill: this.ornate.style?.fill || defaultColor.hex(),
      stroke: this.ornate.style?.stroke || 'rgba(0, 0, 0, 0)',
      strokeWidth: this.ornate.style?.strokeWidth || 8,
      groupId,
    });

    // If we get scaled by the transform tool - correct ourselves.
    this.newCircle.shape.on('transformend', () => {
      if (this.newCircle) {
        const width =
          this.newCircle?.shape.width() * this.newCircle?.shape.scaleX();
        const height =
          this.newCircle?.shape.height() * this.newCircle?.shape.scaleY();
        this.setDimensions(width, height);
      }
    });

    this.ornate.addShape([this.newCircle]);
  };

  onMouseMove = () => {
    if (!this.newCircle) {
      return;
    }
    if (this.isDrawing) {
      const { x, y } = this.ornate.stage.getRelativePointerPosition();

      if (x < this.newCircle.shape.x() || y < this.newCircle.shape.y()) {
        return;
      }

      const width = x - this.newCircle.shape.x();
      const height = y - this.newCircle.shape.y();

      this.setDimensions(width, height);
    }
  };

  onMouseUp = () => {
    this.isDrawing = false;
    this.ornate.emitSaveEvent();
  };

  private setDimensions(width: number, height: number): void {
    if (!this.newCircle) {
      return;
    }
    this.newCircle.shape.offsetX((width / 2) * -1);
    this.newCircle.shape.offsetY((height / 2) * -1);
    this.newCircle.shape.width(width);
    this.newCircle.shape.height(height);

    // set scale
    this.newCircle.shape.scaleX(1);
    this.newCircle.shape.scaleY(1);
  }
}
