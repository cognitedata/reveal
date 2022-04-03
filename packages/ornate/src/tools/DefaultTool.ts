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
      const supportedUndoShapes = ['line', 'rect', 'circle', 'text'];
      if (supportedUndoShapes.includes(this.selectedNode.attrs?.type)) {
        this.ornateInstance.destroyShape(this.selectedNode);
      } else {
        this.selectedNode?.destroy();
        this.selectedNode = null;
        this.ornateInstance.transformer?.setSelectedNodes([]);
      }
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
    // Since documents or other shapes can be added after the transformer
    // was added, make sure to move the transformer to the top to ensure
    // that all the handles are shown correctly
    this.ornateInstance.transformer?.moveToTop();
  };

  onMouseOver = (e: KonvaEventObject<MouseEvent>) => {
    const groupName =
      e.target.attrs?.attachedToGroup || e.target.attrs?.inGroup;
    this.ornateInstance.mouseOverGroup = this.ornateInstance.stage.findOne(
      `#${groupName}`
    );
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
    if (e.target.attrs.name?.includes('_anchor')) {
      // slightly move of anchor or double click on it causes a Transformer
      // throws a "Maximum call stack size exceeded" error
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
      const groupNode = this.ornateInstance.stage.findOne(
        `#${e.target.attrs.attachedToGroup}`
      );

      if (groupNode.attrs.unselectable) {
        return;
      }

      this.selectedNode = groupNode;

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
