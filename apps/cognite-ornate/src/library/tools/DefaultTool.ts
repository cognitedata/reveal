import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'library/types';

import { TextTool } from './TextTool';
import { Tool } from './Tool';

export class DefaultTool extends Tool implements ICogniteOrnateTool {
  cursor = 'default';
  selectedNode: Konva.Node | null = null;
  transformer: Konva.Transformer | null = null;
  mouseMoved = false;

  reset = () => {
    this.mouseMoved = false;
    if (this.selectedNode) {
      this.selectedNode.draggable(false);
    }
    if (this.transformer) {
      this.transformer.nodes([]);
    }
  };

  onDelete = () => {
    if (this.selectedNode) {
      this.selectedNode?.destroy();
      this.selectedNode = null;
      this.transformer?.nodes([]);
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
    this.transformer = new Konva.Transformer({
      rotateEnabled: false,
      resizeEnabled: false,
      keepRatio: true,
      draggable: true,
    });
    this.ornateInstance.baseLayer.add(this.transformer);
    document.addEventListener('keyup', this.onKeyUp);
  };

  onDestroy = () => {
    this.reset();
    document.removeEventListener('keyup', this.onKeyUp);
  };

  onMouseDown = () => {
    this.mouseMoved = false;
  };

  onMouseMove = () => {
    this.mouseMoved = true;
  };

  onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (this.mouseMoved) {
      return;
    }
    this.reset();
    if (e.target.attrs.unselectable) {
      return;
    }

    // If we clicked a text element already selected, swap to 'text' tool and edit
    if (this.selectedNode?.attrs.type === 'text') {
      this.ornateInstance.handleToolChange('text');
      (this.ornateInstance.currentTool as TextTool).onTextEdit(
        this.selectedNode as Konva.Text
      );
      return;
    }
    // If this is defined, we dont select the original target, but the group instead
    // e.g. if we click a PDF image, we move the whole group, not just the image.
    // We also only enable dragging, not scaling
    if (e.target.attrs.attachedToGroup) {
      this.selectedNode = this.ornateInstance.stage.findOne(
        `#${e.target.attrs.attachedToGroup}`
      );
      if (e.target.attrs.resizableGroup) {
        this.transformer?.rotateEnabled(false);
        this.transformer?.resizeEnabled(false);
      } else {
        this.transformer?.rotateEnabled(false);
        this.transformer?.resizeEnabled(false);
      }
    } else {
      this.selectedNode = e.target;
      this.transformer?.rotateEnabled(true);
      this.transformer?.resizeEnabled(true);
    }

    this.selectedNode.draggable(true);
    if (this.transformer) {
      this.transformer.nodes([this.selectedNode]);
    }
  };
}
