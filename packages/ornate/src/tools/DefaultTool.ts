import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'types';

import { TextTool } from './TextTool';
import { Tool } from './Tool';

export class DefaultTool extends Tool implements ICogniteOrnateTool {
  cursor = 'default';
  selectedNode: Konva.Node | null = null;
  mouseMoved = false;

  reset = () => {
    this.mouseMoved = false;
    if (this.selectedNode) {
      this.selectedNode.draggable(false);
      this.selectedNode = null;
    }
    this.ornateInstance.transformer?.setSelectedNodes([]);
  };

  onDelete = () => {
    if (this.selectedNode) {
      this.selectedNode?.destroy();
      this.selectedNode = null;
      this.ornateInstance.transformer?.setSelectedNodes([]);
    }
  };

  onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const evt = new CustomEvent('onDelete', { detail: this.selectedNode });
      document.dispatchEvent(evt);
      this.onDelete();
    }
  };

  onInit = () => {
    const stageContainer = this.ornateInstance.stage.container();
    stageContainer.focus();
    stageContainer.addEventListener('keyup', this.onKeyUp);
  };

  onDestroy = () => {
    this.reset();
    const stageContainer = this.ornateInstance.stage.container();
    stageContainer.removeEventListener('keyup', this.onKeyUp);
  };

  onMouseDown = () => {
    this.mouseMoved = false;
  };

  onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    // Reduce the sensitivity
    if (e.evt.movementX > 1 || e.evt.movementY > 1) {
      this.mouseMoved = true;
    }
  };

  onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (this.mouseMoved) {
      return;
    }

    if (this.selectedNode?.attrs.type === 'text') {
      const tempNode = this.selectedNode as Konva.Text;
      (this.ornateInstance.tools.text as TextTool).onTextEdit(tempNode);
      return;
    }

    this.reset();

    if (e.target.attrs.unselectable) {
      return;
    }
    // If this is defined, we dont select the original target, but the group instead
    // e.g. if we click a PDF image, we move the whole group, not just the image.
    // We also only enable dragging, not scaling
    if (e.target.attrs.attachedToGroup) {
      this.selectedNode = this.ornateInstance.stage.findOne(
        `#${e.target.attrs.attachedToGroup}`
      );

      this.ornateInstance.transformer?.rotateEnabled(false);
      this.ornateInstance.transformer?.resizeEnabled(false);
    } else {
      this.selectedNode = e.target;
      this.ornateInstance.transformer?.rotateEnabled(true);
      this.ornateInstance.transformer?.resizeEnabled(true);
    }

    this.selectedNode.draggable(true);
    this.ornateInstance.transformer?.setSelectedNodes([this.selectedNode]);
  };
}
