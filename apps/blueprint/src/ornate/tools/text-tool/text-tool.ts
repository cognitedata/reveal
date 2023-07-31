import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';
import sanitizeHtml from 'sanitize-html';

import { CogniteOrnate } from '../../ornate';
import { Tool, ToolNodeStyle, ToolType } from '..';
import { Text } from '../../shapes';
import { insertStyles } from '../../utils';

const safeHtmlPattern = /<(?:.|\n)*?>/gm;

const safeStrToHtml = (str = ''): string => {
  return sanitizeHtml(str).replace(safeHtmlPattern, '').replace(/\n/gi, '<br>');
};

const safeHtmlToStr = (str = ''): string =>
  sanitizeHtml(str).replace(/<br>/gi, '\n').replace(safeHtmlPattern, '');

export class TextTool implements Tool {
  ornate: CogniteOrnate;
  name: ToolType = 'TEXT';
  cursor = 'text';
  newText: Text | null = null;
  isToolUsingShapeSettings = true;
  group: Konva.Group | null = null;
  readyToText = true;
  style?: ToolNodeStyle | undefined;

  constructor(ornateInstance: CogniteOrnate) {
    this.ornate = ornateInstance;
    insertStyles(
      `
        .div-textbox-placeholder {
          display: none;
        }
        .div-textbox:empty + .div-textbox-placeholder {
          display: block;
        }
      `,
      { id: 'div-textbox-style' }
    );
  }

  onTextEdit = (textNode: Konva.Text) => {
    const topZIndex = 10000;

    textNode.hide();
    const textPosition = textNode.absolutePosition();

    const areaPosition = {
      x:
        this.ornate.stage.container().getBoundingClientRect().left +
        textPosition.x,
      y:
        this.ornate.stage.container().getBoundingClientRect().top +
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
      textNode.fontSize() * this.ornate.stage.scale().x
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
      textNode.fontSize() * this.ornate.stage.scale().x
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
      this.newText?.shape.removeEventListener('ornate_text_destroy');

      // remove placeholder
      placeholder?.parentNode?.removeChild(placeholder);

      // show node only if there is a text
      if (textNode.text()) {
        textNode.show();
      } else {
        textNode.destroy();
      }
    };

    this.newText?.shape.addEventListener('ornate_text_destroy', removeTextarea);

    textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      e.cancelBubble = true;

      // hide textarea on enter
      // but don't hide on shift + enter
      if (e.key === 'Enter' && !e.shiftKey) {
        textNode.text(safeHtmlToStr(textarea.innerHTML));
        removeTextarea();
        // allow texting
        this.readyToText = true;
        this.ornate.emitSaveEvent();
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
      e.target.attrs?.attachedToGroup || e.target.attrs?.groupId;
    this.group = this.ornate.stage.findOne<Konva.Group>(`#${groupName}`);
    const translatedMousePosition =
      this.ornate.stage.getRelativePointerPosition();

    this.newText = new Text({
      id: uuid(),
      text: '',
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      userGenerated: true,
      type: 'TEXT',
      name: 'drawing',
      groupId: groupName,
      fill: this.ornate.style?.fill || 'black',
      fontSize: Number(this.ornate.style?.fontSize) || 32,
    });

    this.ornate.addShape([this.newText]);
    this.onTextEdit(this.newText.shape);
    // do not start texting on next mouse click
    this.readyToText = false;
  };

  onDestroy = () => {
    this.newText?.shape.fire('ornate_text_destroy');
  };
}
