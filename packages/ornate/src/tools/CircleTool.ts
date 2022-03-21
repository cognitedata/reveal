/* eslint-disable no-unsafe-optional-chaining */
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'types';
import { v4 as uuid } from 'uuid';

import { Tool } from './Tool';

export class CircleTool extends Tool implements ICogniteOrnateTool {
  cursor = 'crosshair';
  newCircle: Konva.Circle | null = null;
  group: Konva.Group | null = null;
  isToolUsingShapeSettings = true;

  onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    this.ornateInstance.isDrawing = true;

    // If we're over an item with a group attachment, add it there instead.
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;

    this.group = this.ornateInstance.stage.findOne(
      `#${groupName}`
    ) as Konva.Group;

    const translatedMousePosition = this.getPosition();
    this.newCircle = new Konva.Circle({
      id: uuid(),
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      width: 1,
      height: 1,
      userGenerated: true,
      type: 'circle',
      name: 'drawing',
      fill: `rgba(255,255,255,0)`,
      inGroup: groupName,
      ...this.shapeSettings.circle,
    });

    // If we get scaled by the transform tool - correct ourselves.
    this.newCircle.on('transformend', () => {
      if (this.newCircle) {
        const width = this.newCircle?.width() * this.newCircle?.scaleX();
        const height = this.newCircle?.height() * this.newCircle?.scaleY();
        this.setDimensions(width, height);
      }
    });

    this.ornateInstance.addShape(this.newCircle);
  };

  onMouseMove = () => {
    const { baseLayer } = this.ornateInstance;
    if (!this.newCircle) {
      return;
    }
    if (this.ornateInstance.isDrawing) {
      const translatedMousePosition = this.getPosition();

      const width = translatedMousePosition.x - this.newCircle.x();
      const height = translatedMousePosition.y - this.newCircle.y();
      this.setDimensions(width, height);

      baseLayer.draw();
    }
  };

  onMouseUp = () => {
    this.ornateInstance.isDrawing = false;
  };

  private getPosition = () => {
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

  private setDimensions(width: number, height: number): void {
    if (!this.newCircle) {
      return;
    }

    // correct negative dimensions
    const absWidth = Math.abs(width);
    const absHeight = Math.abs(height);

    this.newCircle.offsetX((width / 2) * -1);
    this.newCircle.offsetY((height / 2) * -1);
    this.newCircle.width(absWidth);
    this.newCircle.height(absHeight);

    // set scale
    this.newCircle.scaleX(1);
    this.newCircle.scaleY(1);
  }
}
