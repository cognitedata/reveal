import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { DefaultTool } from 'tools';
import { ICogniteOrnateTool } from 'types';
import { v4 as uuid } from 'uuid';
import sanitizeHtml from 'sanitize-html';

import { insertStyles } from '../utils';
import { CogniteOrnate } from '../cognite-ornate';

import { Tool } from './Tool';

const safeHtmlPattern = /<(?:.|\n)*?>/gm;

const safeStrToHtml = (str = ''): string => {
  return sanitizeHtml(str).replace(safeHtmlPattern, '').replace(/\n/gi, '<br>');
};

const safeHtmlToStr = (str = ''): string =>
  sanitizeHtml(str).replace(/<br>/gi, '\n').replace(safeHtmlPattern, '');

export class TextTool extends Tool implements ICogniteOrnateTool {
  cursor = 'text';
  newText: Konva.Text | null = null;
  isToolUsingShapeSettings = true;
  group: Konva.Group | null = null;
  readyToText = true;

  constructor(ornateInstance: CogniteOrnate) {
    super(ornateInstance);
    insertStyles(
      `
.div-textbox-placeholder {
  display: none;
}
.div-textbox:empty + .div-textbox-placeholder {
  display: block;
}`,
      { id: 'div-textbox-style' }
    );
  }

  onTextEdit = (textNode: Konva.Text) => {
    const topZIndex = 10000;

    textNode.hide();
    const textPosition = textNode.absolutePosition();

    const areaPosition = {
      x:
        this.ornateInstance.stage.container().getBoundingClientRect().left +
        textPosition.x,
      y:
        this.ornateInstance.stage.container().getBoundingClientRect().top +
        textPosition.y,
    };

    const nodeTextValue = textNode.text();

    const textarea = document.createElement('div');
    textarea.contentEditable = 'true';
    document.body.appendChild(textarea);
    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the content-editable div can be different
    // and sometimes it is hard to make it 100% the same. But we will try...

    textarea.innerHTML = safeStrToHtml(nodeTextValue);
    textarea.className = 'div-textbox';
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.fontSize = `${
      textNode.fontSize() * this.ornateInstance.stage.scale().x
    }px`;
    textarea.style.border = 'none';
    textarea.style.zIndex = `${topZIndex - 20}`;
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

    textarea.style.transform = transform;

    setTimeout(() => {
      textarea.focus();
    });

    // show placeholder
    const placeholder = document.createElement('div');
    placeholder.style.color = '#bfbfbf'; // --cogs-greyscale-grey4;

    placeholder.style.position = 'absolute';
    placeholder.style.top = `${areaPosition.y}px`;
    placeholder.style.left = `${areaPosition.x}px`;
    placeholder.style.fontSize = `${
      textNode.fontSize() * this.ornateInstance.stage.scale().x
    }px`;
    placeholder.style.padding = '0px';
    placeholder.style.margin = '0px';
    placeholder.style.border = 'none';
    placeholder.style.zIndex = `${topZIndex - 10}`;
    placeholder.style.fontFamily = textNode.fontFamily();
    placeholder.style.lineHeight = String(textNode.lineHeight());
    placeholder.innerText = 'Type something';
    placeholder.className = 'div-textbox-placeholder';

    document.body.appendChild(placeholder);

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea);
      this.newText?.removeEventListener('ornate_text_destroy');

      // remove placeholder
      placeholder?.parentNode?.removeChild(placeholder);

      // show node only if there is a text
      if (textNode.text()) {
        textNode.show();
        (this.ornateInstance.tools.default as DefaultTool).reset();
      } else {
        textNode.destroy();
      }
    };

    this.newText?.addEventListener('ornate_text_destroy', removeTextarea);

    textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      e.cancelBubble = true;

      // hide textarea on enter
      // but don't hide on shift + enter
      if (e.key === 'Enter' && !e.shiftKey) {
        textNode.text(safeHtmlToStr(textarea.innerHTML));
        removeTextarea();
        // allow texting
        this.readyToText = true;
        return;
      }
      // on esc do not set value back to node
      if (e.key === 'Escape') {
        removeTextarea();
        this.readyToText = true;
      }
    });

    const handleOutsideClick = (e: MouseEvent) => {
      e.cancelBubble = true;
      if (e.target !== textarea) {
        textNode.text(safeHtmlToStr(textarea.innerHTML));
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
    if (!this.readyToText) {
      // allow texting after second mouse click
      this.readyToText = true;
      return;
    }
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;
    this.group = this.ornateInstance.stage.findOne(
      `#${groupName}`
    ) as Konva.Group;
    const translatedMousePosition = this.getPosition();

    this.newText = new Konva.Text({
      id: uuid(),
      text: '',
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      userGenerated: true,
      type: 'text',
      name: 'drawing',
      inGroup: groupName,
      ...this.shapeSettings.text,
    });

    this.ornateInstance.addShape(this.newText);
    this.onTextEdit(this.newText);
    // do not start texting on next mouse click
    this.readyToText = false;
  };

  onDestroy = () => {
    this.newText?.fire('ornate_text_destroy');
  };
}
