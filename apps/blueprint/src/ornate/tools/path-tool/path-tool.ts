import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';

import { CogniteOrnate } from '../../ornate';
import { Line } from '../../shapes';
import { Tool, ToolNodeStyle, ToolType } from '..';

export class PathTool implements Tool {
  cursor = 'crosshair';
  name: ToolType = 'PATH';
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
    const { x: startX, y: startY } =
      this.ornate.stage.getRelativePointerPosition();
    if (!this.newLine) {
      // If we're over an item with a group attachment, add it there instead.
      const groupId =
        e.target.attrs?.type === 'GROUP' ? e.target.id() : undefined;
      const group = groupId
        ? this.ornate.stage.findOne<Konva.Group>(`#${groupId}`)
        : undefined;
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
    } else {
      const currPoints = this.newLine.shape.points();
      // If we are within 2 pixels of the 2nd most recent point
      if (
        currPoints[currPoints.length - 3] - 2 < startY &&
        startY < currPoints[currPoints.length - 3] + 2 &&
        currPoints[currPoints.length - 4] - 2 < startX &&
        startX < currPoints[currPoints.length - 4] + 2
      ) {
        this.isDrawing = false;
        this.newLine = null;
        this.ornate.emitSaveEvent();
        return;
      }
      this.newLine.shape.points([...currPoints, startX, startY]);
    }
  };

  onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!this.newLine) {
      return;
    }
    if (this.isDrawing) {
      const { x, y } = this.ornate.stage.getRelativePointerPosition();
      const nextPoints = [...this.newLine.shape.points()];
      // If shift, draw straight
      if (e.evt.shiftKey) {
        const isVertical =
          Math.abs(x - nextPoints[nextPoints.length - 4]) <
          Math.abs(y - nextPoints[nextPoints.length - 3]);

        if (isVertical) {
          nextPoints[nextPoints.length - 1] = y;
          nextPoints[nextPoints.length - 2] = nextPoints[nextPoints.length - 4];
        } else {
          nextPoints[nextPoints.length - 1] = nextPoints[nextPoints.length - 3];
          nextPoints[nextPoints.length - 2] = x;
        }
      } else {
        nextPoints[nextPoints.length - 1] = y;
        nextPoints[nextPoints.length - 2] = x;
      }

      this.newLine.shape.points(nextPoints);
    }
  };
}
