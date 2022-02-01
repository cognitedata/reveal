import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'types';
import { v4 as uuid } from 'uuid';

import { Tool } from './Tool';

export class LineTool extends Tool implements ICogniteOrnateTool {
  cursor = 'crosshair';
  newLine: Konva.Line | null = null;
  group: Konva.Group | null = null;
  isToolUsingShapeSettings = true;

  getPosition = () => {
    let { x, y } = this.ornateInstance.getTranslatedPointerPosition();
    if (this.group) {
      x -= this.group.x();
      y -= this.group.y();
    }
    return {
      x,
      y,
    };
  };

  onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    this.ornateInstance.isDrawing = true;

    // If we're over an item with a group attachment, add it there instead.
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;
    const group = this.ornateInstance.stage.findOne(`#${groupName}`);
    this.group = group as Konva.Group;
    const { x: startX, y: startY } = this.getPosition();
    this.newLine = new Konva.Line({
      id: uuid(),
      points: [startX, startY, startX, startY],
      userGenerated: true,
      name: 'drawing',
      type: 'line',
      fill: `rgba(255,255,255,0)`,
      inGroup: groupName,
      ...this.shapeSettings.line,
    });

    this.ornateInstance.addShape(this.newLine);
  };

  onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const { drawingLayer } = this.ornateInstance;
    if (!this.newLine) {
      return;
    }
    if (this.ornateInstance.isDrawing) {
      const { x, y } = this.getPosition();
      const currPoints = this.newLine?.points();
      // If shift, draw straight
      if (e.evt.shiftKey) {
        const isVertical =
          Math.abs(x - currPoints[0]) < Math.abs(y - currPoints[1]);
        if (isVertical) {
          this.newLine?.points([
            currPoints[0],
            currPoints[1],
            currPoints[0],
            y,
          ]);
        } else {
          this.newLine?.points([
            currPoints[0],
            currPoints[1],
            x,
            currPoints[1],
          ]);
        }
      } else {
        this.newLine.points([currPoints[0], currPoints[1], x, y]);
      }

      drawingLayer.draw();
    }
  };

  onMouseUp = () => {
    this.ornateInstance.isDrawing = false;
  };
}
