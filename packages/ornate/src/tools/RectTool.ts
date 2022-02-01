/* eslint-disable no-unsafe-optional-chaining */
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'types';
import { v4 as uuid } from 'uuid';

import { Tool } from './Tool';

export class RectTool extends Tool implements ICogniteOrnateTool {
  cursor = 'crosshair';
  newRect: Konva.Rect | null = null;
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
    this.group = this.ornateInstance.stage.findOne(
      `#${groupName}`
    ) as Konva.Group;

    const translatedMousePosition = this.getPosition();
    this.newRect = new Konva.Rect({
      id: uuid(),
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      width: 1,
      height: 1,
      userGenerated: true,
      type: 'rect',
      name: 'drawing',
      fill: `rgba(255,255,255,0)`,
      // TO DO: Refactor how we do this
      inGroup: groupName,
      ...this.shapeSettings.rect,
    });

    // If we get scaled by the transform tool - correct ourselves.
    this.newRect.on('transformend', () => {
      if (this.newRect) {
        this.newRect.width(this.newRect?.width() * this.newRect?.scaleX());
        this.newRect.scaleX(1);

        this.newRect.height(this.newRect?.height() * this.newRect?.scaleY());
        this.newRect.scaleY(1);
      }
    });

    this.ornateInstance.addShape(this.newRect);
  };

  onMouseMove = () => {
    const { baseLayer } = this.ornateInstance;
    if (!this.newRect) {
      return;
    }
    if (this.ornateInstance.isDrawing) {
      const translatedMousePosition = this.getPosition();

      this.newRect.width(translatedMousePosition.x - this.newRect.x());
      this.newRect.height(translatedMousePosition.y - this.newRect.y());

      baseLayer.draw();
    }
  };

  onMouseUp = () => {
    this.ornateInstance.isDrawing = false;
  };
}
