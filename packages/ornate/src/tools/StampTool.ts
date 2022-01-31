import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'types';
import { v4 as uuid } from 'uuid';

import { Tool } from './Tool';

export class StampTool extends Tool implements ICogniteOrnateTool {
  cursor = 'crosshair';
  newStamp: Konva.Image | null = null;
  group: Konva.Group | null = null;
  imageURL = '';
  previewNode: Konva.Node | null = null;
  imageSize: [number, number] = [0, 0];

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

  getStampPosition = () => {
    const translatedMousePosition = this.getPosition();
    return {
      x: translatedMousePosition.x - this.imageSize[0] / 2,
      y: translatedMousePosition.y - this.imageSize[1] / 2,
    };
  };

  onDestroy = () => {
    this.previewNode?.destroy();
    this.previewNode = null;
  };

  setImageURL = (nextURL: string) => {
    this.previewNode?.destroy();
    const translatedMousePosition = this.getStampPosition();
    this.imageURL = nextURL;
    Konva.Image.fromURL(this.imageURL, (node: Konva.Shape) => {
      node.setAttrs({
        id: uuid(),
        x: translatedMousePosition.x,
        y: translatedMousePosition.y,
        userGenerated: true,
        opacity: 0.5,
      });
      this.imageSize = [node.width(), node.height()];

      this.ornateInstance.baseLayer.add(node);

      this.previewNode = node;
    });
  };

  onMouseMove = () => {
    const translatedMousePosition = this.getStampPosition();
    if (this.previewNode) {
      this.previewNode.x(translatedMousePosition.x);
      this.previewNode.y(translatedMousePosition.y);
    }
  };
  onMouseDown = () => {
    this.previewNode?.hide();
  };

  onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    this.previewNode?.show();
    const { baseLayer } = this.ornateInstance;
    this.ornateInstance.isDrawing = true;

    // If we're over an item with a group attachment, add it there instead.
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;
    this.group = this.ornateInstance.stage.findOne(
      `#${groupName}`
    ) as Konva.Group;

    const translatedMousePosition = this.getStampPosition();

    Konva.Image.fromURL(this.imageURL, (node: Konva.Shape) => {
      node.setAttrs({
        id: uuid(),
        x: translatedMousePosition.x,
        y: translatedMousePosition.y,
        userGenerated: true,
        type: 'stamp',
        url: this.imageURL,
        name: 'stamp',
        inGroup: groupName,
      });

      if (!this.group) {
        baseLayer.add(node);
        baseLayer.draw();
        return;
      }
      this.group.add(node);
    });
  };
}
