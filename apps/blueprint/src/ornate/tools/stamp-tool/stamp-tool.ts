import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';

import { Image } from '../../shapes';
import { CogniteOrnate } from '../../ornate';
import { Tool, ToolType } from '..';

export class StampTool implements Tool {
  cursor = 'crosshair';
  name: ToolType = 'STAMP';
  ornate: CogniteOrnate;
  newStamp: Konva.Image | null = null;
  group: Konva.Group | null = null;
  imageURL = '';
  previewNode: Konva.Node | null = null;
  imageSize: [number, number] = [0, 0];
  isDrawing = false;

  constructor(instance: CogniteOrnate) {
    this.ornate = instance;
  }

  getStampPosition = () => {
    const translatedMousePosition =
      this.ornate.stage.getRelativePointerPosition();
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
    this.imageURL = nextURL;
    Konva.Image.fromURL(this.imageURL, (node: Konva.Shape) => {
      node.setAttrs({
        id: uuid(),
        x: -9999,
        y: -9999,
        userGenerated: true,
        opacity: 0.5,
      });
      this.imageSize = [node.width(), node.height()];

      this.ornate.layers.top.add(node);

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
    this.isDrawing = true;

    // If we're over an item with a group attachment, add it there instead.
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;
    this.group = this.ornate.stage.findOne(`#${groupName}`) as Konva.Group;

    const { x, y } = this.getStampPosition();
    const finalImage = new Image({
      id: uuid(),
      x,
      y,
      imageURL: this.imageURL,
    });
    this.ornate.addShape([finalImage]);
  };
}
