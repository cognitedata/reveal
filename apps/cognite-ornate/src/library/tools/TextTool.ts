import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'library/types';

import { Tool } from './Tool';

export class TextTool extends Tool implements ICogniteOrnateTool {
  cursor = 'text';
  newText: Konva.Text | null = null;
  isToolUsingShapeSettings = true;
  group: Konva.Group | null = null;

  onTextEdit = (textNode: Konva.Text) => {
    textNode.hide();
    const textPosition = textNode.absolutePosition();

    const areaPosition = {
      x: this.ornateInstance.stage.container().offsetLeft + textPosition.x,
      y: this.ornateInstance.stage.container().offsetTop + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the textarea can be different
    // and sometimes it is hard to make it 100% the same. But we will try...
    textarea.value = textNode.text();
    textarea.placeholder = 'Type something';
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${
      textarea.value.length === 0
        ? textarea.placeholder.length * textNode.fontSize()
        : textNode.width() - textNode.padding() * 2
    }px`;
    textarea.style.height = `${
      textNode.height() - textNode.padding() * 2 + 5
    }px`;
    textarea.style.fontSize = `${
      textNode.fontSize() * this.ornateInstance.stage.scale().x
    }px`;
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = String(textNode.lineHeight());
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();
    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }

    let px = 0;
    // also we need to slightly move textarea on firefox
    // because it jumps a bit
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      px += 2 + Math.round(textNode.fontSize() / 20);
    }
    transform += `translateY(-${px}px)`;

    textarea.style.transform = transform;

    // reset height
    textarea.style.height = 'auto';
    // after browsers resized it we can set actual value
    textarea.style.height = `${textarea.scrollHeight + 3}px`;
    setTimeout(() => {
      textarea.focus();
    });

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      textNode.show();
    };

    const setTextareaWidth = (nextWidth?: number) => {
      let newWidth = nextWidth;

      if (!newWidth) {
        // set width for placeholder
        newWidth = textarea.value.length * textNode.fontSize();
      }
      // some extra fixes on different browsers
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      const isFirefox =
        navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isSafari || isFirefox) {
        newWidth = Math.ceil(newWidth);
      }

      const isEdge = document.DOCUMENT_NODE || /Edge/.test(navigator.userAgent);
      if (isEdge) {
        newWidth += 1;
      }
      textarea.style.width = `${newWidth}px`;
    };

    textarea.addEventListener('keydown', (e) => {
      e.cancelBubble = true;
      // hide on enter
      // but don't hide on shift + enter
      if (e.keyCode === 13 && !e.shiftKey) {
        textNode.text(textarea.value);
        removeTextarea();
      }
      // on esc do not set value back to node
      if (e.keyCode === 27) {
        removeTextarea();
      }

      setTextareaWidth();
      textarea.style.height = 'auto';
      textarea.style.height = `${
        textarea.scrollHeight + textNode.fontSize()
      }px`;
    });

    const handleOutsideClick = (e: MouseEvent) => {
      e.cancelBubble = true;
      if (e.target !== textarea) {
        textNode.text(textarea.value);
        removeTextarea();
        window.removeEventListener('mousedown', handleOutsideClick);
      }
    };
    setTimeout(() => {
      window.addEventListener('mousedown', handleOutsideClick);
    });
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
    if (e.target.parent?.attrs.boundBoxFunc) {
      return;
    }
    if (e.target.attrs.type === 'text') {
      this.onTextEdit(e.target as Konva.Text);
      return;
    }
    const { drawingLayer } = this.ornateInstance;
    const groupName = e.target.attrs?.attachedToGroup;
    this.group = this.ornateInstance.stage.findOne(
      `#${groupName}`
    ) as Konva.Group;
    const translatedMousePosition = this.getPosition();

    this.newText = new Konva.Text({
      text: '',
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      fontSize: this.shapeSettings.fontSize || 32,
      fill: this.shapeSettings.fill || this.shapeSettings.strokeColor,
      userGenerated: true,
      type: 'text',
      name: 'drawing',
    });

    if (!this.group) {
      drawingLayer.add(this.newText);
      drawingLayer.draw();
    } else {
      this.group.add(this.newText);
    }
    this.onTextEdit(this.newText);
  };
}
