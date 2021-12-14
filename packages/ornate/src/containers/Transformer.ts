import { CogniteOrnate } from 'cognite-ornate';
import Konva from 'konva';
import { NodeConfig, Node } from 'konva/lib/Node';
import noop from 'lodash/noop';
import { v4 as uuid } from 'uuid';

export class OrnateTransformer extends Konva.Transformer {
  group?: Konva.Group;
  groupName?: string;
  clipboard: Node<NodeConfig>[] = [];
  onSelectNodes: (nodes: Node<NodeConfig>[]) => void = noop;
  onCopyNodes: () => void = noop;
  ornateInstance?: CogniteOrnate;

  constructor(ornateInstance?: CogniteOrnate) {
    super();
    this.ornateInstance = ornateInstance;
  }

  setSelectedNodes = (nodes: Node<NodeConfig>[]) => {
    // Update to accept multiple nodes
    if (!nodes) {
      return;
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
      const { x, y } = this.getPosition(this.group);
      return node.clone({
        id: uuid(),
        inGroup: this.groupName,
        x,
        y,
      });
    });

    if (this.group) {
      this.group.add(...nodesFromClipboard);
    } else {
      this.ornateInstance?.drawingLayer.add(...nodesFromClipboard);
    }

    this.setSelectedNodes(nodesFromClipboard);
  };

  updateGroup = (group: Konva.Group, groupName: string) => {
    this.group = group;
    this.groupName = groupName;
  };
}
