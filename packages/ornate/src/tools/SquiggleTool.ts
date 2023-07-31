/* eslint-disable no-unsafe-optional-chaining */
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'types';
import { v4 as uuid } from 'uuid';

import Squiggle from '../shapes/Squiggle';

import { Tool } from './Tool';

export class SquiggleTool extends Tool implements ICogniteOrnateTool {
  private shape: Konva.Shape | null = null;
  cursor = 'crosshair';
  group: Konva.Group | null = null;
  isToolUsingShapeSettings = true;

  private rescale = () => {
    if (this.shape) {
      this.shape.width(this.shape.width() * this.shape?.scaleX());
      this.shape.scaleX(1);

      this.shape.height(this.shape.height() * this.shape?.scaleY());
      this.shape.scaleY(1);
    }
  };

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
    const { baseLayer } = this.ornateInstance;
    this.ornateInstance.isDrawing = true;

    // If we're over an item with a group attachment, add it there instead.
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;
    this.group = this.ornateInstance.stage.findOne(
      `#${groupName}`
    ) as Konva.Group;

    const translatedMousePosition = this.getPosition();
    this.shape = new Squiggle({
      id: uuid(),
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      width: 1,
      height: 1,
      userGenerated: true,
      type: 'squiggle',
      name: 'drawing',
      inGroup: groupName,
      ...this.shapeSettings.squiggle,
    });

    this.shape.on('transform', this.rescale);
    this.shape.on('transformend', this.rescale);

    if (!this.group) {
      baseLayer.add(this.shape);
      baseLayer.draw();
      return;
    }
    this.group.add(this.shape);
  };

  onMouseMove = () => {
    const { baseLayer } = this.ornateInstance;
    if (!this.shape) {
      return;
    }
    if (this.ornateInstance.isDrawing) {
      const translatedMousePosition = this.getPosition();

      this.shape.width(translatedMousePosition.x - this.shape.x());
      this.shape.height(translatedMousePosition.y - this.shape.y());

      baseLayer.draw();
    }
  };

  onMouseUp = () => {
    this.ornateInstance.isDrawing = false;
  };
}
