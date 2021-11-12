import Konva from 'konva';
import { NodeConfig, Node } from 'konva/lib/Node';
import noop from 'lodash/noop';

export class OrnateTransformer extends Konva.Transformer {
  onSelectNodes: (nodes: Node<NodeConfig>[]) => void = noop;

  setSelectedNodes = (nodes: Node<NodeConfig>[]) => {
    // Update to accept multiple nodes
    if (!nodes) {
      return;
    }

    this.nodes(nodes);
    this.onSelectNodes(nodes);
  };
}
