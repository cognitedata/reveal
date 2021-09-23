import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'library/types';

import { Tool } from './Tool';

export class TextTool extends Tool implements ICogniteOrnateTool {
  cursor = 'text';
  newText: Konva.Text | null = null;

  onTextEdit = (e: KonvaEventObject<any>) => {
    if (!this.newText) {
      return;
    }
    e.cancelBubble = true;

    const textPosition = this.newText.getAbsolutePosition();

    const stageBox = this.ornateInstance.stage
      .container()
      .getBoundingClientRect();

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = this.newText.text();
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = this.newText.width().toString();

    textarea.focus();

    textarea.addEventListener('keydown', (e) => {
      // hide on enter
      if (e.keyCode === 13) {
        this.newText?.text(textarea.value);
        document.body.removeChild(textarea);
      }
    });
  };

  onMouseDown = () => {
    const { drawingLayer } = this.ornateInstance;

    const translatedMousePosition =
      this.ornateInstance.getTranslatedPointerPosition();
    this.newText = new Konva.Text({
      text: 'Click here to edit this text',
      x: translatedMousePosition.x,
      y: translatedMousePosition.y,
      fontSize: 20,
      userGenerated: true,
      type: 'text',
    });
    drawingLayer.add(this.newText);
    this.newText.on('mousedown', this.onTextEdit);
    drawingLayer.draw();
  };
}
