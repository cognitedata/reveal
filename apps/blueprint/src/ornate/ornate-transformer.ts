/* eslint-disable no-param-reassign */
import Konva from 'konva';
import { NodeConfig, Node } from 'konva/lib/Node';
import noop from 'lodash/noop';
import { v4 as uuid } from 'uuid';

import { OrnateShapeConfig } from './shapes';
import { CogniteOrnate } from './ornate';

export class OrnateTransformer extends Konva.Transformer {
  clipboard: Node<NodeConfig>[] = [];
  onSelectNodes: (nodes: Node<NodeConfig>[]) => void = noop;
  onCopyNodes: () => void = noop;
  ornateInstance?: CogniteOrnate;

  constructor(ornateInstance?: CogniteOrnate) {
    super({ attrs: { preventSerialize: true } });
    this.ornateInstance = ornateInstance;

    this.hide();

    this.ornateInstance?.stage.container().addEventListener('keydown', (e) => {
      if (e.metaKey) {
        if (e.key === 'c') {
          this.copySelectedNodes();
        }
        if (e.key === 'v') {
          this.pasteSelectedNodes();
        }
      }
    });

    this.on('dragend transformend', () => {
      ornateInstance?.emitSaveEvent();
    });
  }

  setSelectedNodes = (
    highlightedNodes: Node<OrnateShapeConfig>[],
    additive = false
  ) => {
    const parsedHighlightedNodes = highlightedNodes.map((node) => {
      if (node.attrs.forceSelectGroup && node.attrs.groupId) {
        const groupNodeInStage = this.ornateInstance?.stage.find(
          `#${node.attrs.groupId}`
        )[0];

        if (!groupNodeInStage) {
          // eslint-disable-next-line no-console
          console.warn('Could not find group with ID: ', node.attrs.groupId);
          return node;
        }
        return groupNodeInStage;
      }
      return node;
    });

    const selectedIds = this.nodes().map((node) => node.id());
    const highlightedNodeIds = parsedHighlightedNodes.map((node) => node.id());
    // A type must be defined for the item to be selectable
    let acceptedNodes = parsedHighlightedNodes.filter(
      (node) =>
        node.attrs.type &&
        node.attrs.unselectable !== true &&
        node.attrs.locked !== true
    );

    // Update to accept multiple nodes
    if (additive) {
      acceptedNodes = acceptedNodes.concat(this.nodes());
      acceptedNodes = acceptedNodes.filter(
        (node) =>
          !(
            selectedIds.includes(node.id()) &&
            highlightedNodeIds.includes(node.id())
          )
      );
    }

    // The Transformer can affect the calculated sizing of the parent layer
    // when it's not attached any nodes, so we hide it when this is the case
    // to avoid this edge case. This is probably a Konva bug.
    if (acceptedNodes.length === 0 && this.isVisible()) {
      this.hide();
    }

    if (acceptedNodes.length > 0 && !this.isVisible()) {
      this.show();
    }
    this.nodes().forEach((node) => {
      node.setDraggable(false);
    });
    this.nodes(acceptedNodes);
    acceptedNodes.forEach((node) => {
      node.setDraggable(true);
    });

    this.fire('nodes-update');

    this.onSelectNodes(acceptedNodes);
  };

  copySelectedNodes = () => {
    this.clipboard = this.nodes();
  };

  pasteSelectedNodes = () => {
    if (this.clipboard.length === 0 || !this.ornateInstance) {
      return;
    }
    const nodesFromClipboard = this.clipboard
      .map((node: Node<NodeConfig>) => {
        if (!this.ornateInstance) return null;

        const { x, y } = node.getRelativePointerPosition();
        return node.clone({
          id: uuid(),
          x,
          y,
        });
      })
      .filter(Boolean) as (Konva.Shape | Konva.Group)[];

    this.ornateInstance.layers.main.add(...nodesFromClipboard);

    this.setSelectedNodes(nodesFromClipboard);
  };
}
