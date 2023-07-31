import { CogniteOrnate } from 'cognite-ornate';
import Konva from 'konva';
import { NodeConfig, Node } from 'konva/lib/Node';
import noop from 'lodash/noop';
import { v4 as uuid } from 'uuid';

export class OrnateTransformer extends Konva.Transformer {
  clipboard: Node<NodeConfig>[] = [];
  onSelectNodes: (nodes: Node<NodeConfig>[]) => void = noop;
  onCopyNodes: () => void = noop;
  ornateInstance?: CogniteOrnate;

  constructor(ornateInstance?: CogniteOrnate) {
    super();
    this.ornateInstance = ornateInstance;
    this.hide();
  }

  setSelectedNodes = (nodes: Node<NodeConfig>[]) => {
    // Update to accept multiple nodes
    if (!nodes) {
      return;
    }

    // The Transformer can affect the calculated sizing of the parent layer
    // when it's not attached any nodes, so we hide it when this is the case
    // to avoid this edge case. This is probably a Konva bug.
    if (nodes.length === 0 && this.isVisible()) {
      this.hide();
    }

    if (nodes.length > 0 && !this.isVisible()) {
      this.show();
    }

    this.nodes(nodes);
    this.onSelectNodes(nodes);
  };

  getPosition = (group?: Konva.Node) => {
    if (!this.ornateInstance) {
      return { x: 0, y: 0 };
    }

    let { x, y } = this.ornateInstance.getTranslatedPointerPosition();
    if (group) {
      x -= group.x();
      y -= group.y();
    }
    return {
      x,
      y,
    };
  };

  copySelectedNodes = () => {
    // Update to accept other types of nodes
    this.clipboard = this.nodes().filter((node: Node<NodeConfig>) => {
      return (
        node.attrs.type === 'rect' ||
        node.attrs.type === 'circle' ||
        node.attrs.type === 'line' ||
        node.attrs.type === 'stamp'
      );
    });
  };

  pasteSelectedNodes = () => {
    if (this.clipboard.length === 0) {
      return;
    }

    const nodesFromClipboard = this.clipboard.map((node: Node<NodeConfig>) => {
      const { x, y } = this.getPosition(this.ornateInstance?.mouseOverGroup);
      return node.clone({
        id: uuid(),
        inGroup: this.ornateInstance?.mouseOverGroup?.id(),
        x,
        y,
      });
    });

    if (this.ornateInstance?.mouseOverGroup) {
      this.ornateInstance?.mouseOverGroup.add(...nodesFromClipboard);
    } else {
      this.ornateInstance?.baseLayer.add(...nodesFromClipboard);
    }

    this.setSelectedNodes(nodesFromClipboard);
  };
}
