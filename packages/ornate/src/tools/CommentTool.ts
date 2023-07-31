import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'types';

import { CommentToolIcon } from './CommentToolUtils';
import { Tool } from './Tool';

export interface CommentToolAtrs {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  userGenerated: boolean;
  type: string;
}

export class CommentTool extends Tool implements ICogniteOrnateTool {
  cursor = 'default';
  group: Konva.Group | null = null;
  isToolUsingShapeSettings = false;
  hoveringCommentIcon = false;

  static create(attrs: CommentToolAtrs): Konva.Image {
    const commentIconUrl = `data:image/svg+xml;base64,${window.btoa(
      CommentToolIcon
    )}`;

    const image: Konva.Image = new Konva.Image({
      image: undefined,
      draggable: true,
      x: attrs.x,
      y: attrs.y,
      width: attrs.width,
      height: attrs.height,
      id: attrs.id,
    });
    Konva.Image.fromURL(commentIconUrl, (imageFromUrl: Konva.Image) => {
      image.image(imageFromUrl.image());
      image.setAttr('userGenerated', true);
      image.setAttr('type', attrs.type);

      image.on('dblclick', (e) => {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        e.cancelBubble = true;

        const evt = new CustomEvent('onCommentClick', { detail: image });
        document.dispatchEvent(evt);
      });
    });
    return image as Konva.Image;
  }

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
    if (this.hoveringCommentIcon) return;

    const { baseLayer } = this.ornateInstance;

    // If we're over an item with a group attachment, add it there instead.
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;
    this.group = this.ornateInstance.stage.findOne(
      `#${groupName}`
    ) as Konva.Group;

    const translatedMousePosition = this.getPosition();
    const imgAttrs = {
      id: Date.now().toString(),
      userGenerated: true,
      type: 'comment',
      width: 32,
      height: 32,
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
    } as CommentToolAtrs;
    const image = CommentTool.create(imgAttrs);

    image.on('mouseover', () => {
      this.hoveringCommentIcon = true;
    });
    image.on('mouseleave', () => {
      this.hoveringCommentIcon = false;
    });

    if (!this.group) {
      baseLayer.add(image);
      baseLayer.draw();
      return;
    }
    this.group.add(image);

    const evt = new CustomEvent('onCommentClick', { detail: image });
    document.dispatchEvent(evt);
  };
}
