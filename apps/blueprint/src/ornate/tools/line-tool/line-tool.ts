import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';

import { CogniteOrnate } from '../../ornate';
import { Line } from '../../shapes';
import { Tool, ToolNodeStyle, ToolType } from '..';

export class LineTool implements Tool {
  cursor = 'crosshair';
  name: ToolType = 'LINE';
  newLine: Line | null = null;
  ornate: CogniteOrnate;
  isToolUsingShapeSettings = true;
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

    const { x: startX, y: startY } =
      this.ornate.stage.getRelativePointerPosition();

    this.newLine = new Line({
      id: uuid(),
      points: [startX, startY, startX, startY],
      userGenerated: true,
      name: 'drawing',
      type: 'LINE',
      stroke: this.ornate.style?.stroke || 'rgba(0, 0, 0, 1)',
      strokeWidth: this.ornate.style?.strokeWidth || 8,
      groupId: group?.id(),
    });

    this.ornate.addShape([this.newLine]);
  };

  onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!this.newLine) {
      return;
    }
    if (this.isDrawing) {
      const { x, y } = this.ornate.stage.getRelativePointerPosition();
      const currPoints = this.newLine.shape.points();
      // If shift, draw straight
      if (e.evt.shiftKey) {
        const isVertical =
          Math.abs(x - currPoints[0]) < Math.abs(y - currPoints[1]);
        if (isVertical) {
          this.newLine?.shape.points([
            currPoints[0],
            currPoints[1],
            currPoints[0],
            y,
          ]);
        } else {
          this.newLine?.shape.points([
            currPoints[0],
            currPoints[1],
            x,
            currPoints[1],
          ]);
        }
      } else {
        this.newLine.shape.points([currPoints[0], currPoints[1], x, y]);
      }
    }
  };

  onMouseUp = () => {
    this.isDrawing = false;

    this.ornate.emitSaveEvent();
  };
}
