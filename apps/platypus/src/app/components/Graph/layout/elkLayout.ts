import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Link } from '../Graph';

export const getELKNodes = async (
  nodes: (Element & { __data__: Node })[],
  links: Link[]
): Promise<Node[]> => {
  try {
    if (nodes.length === 0) {
      throw new Error('Unable to start ELK positioning as there are no nodes.');
    }
    const elk = new ELK();
    const graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'LEFT',
        'elk.layered.spacing.componentComponent': '100',
        'elk.layered.spacing.componentNode': '100',
        'elk.layered.spacing.edgeNodeBetweenLayers': '100',
        'elk.layered.spacing.nodeNodeBetweenLayers': '100',
        'elk.layered.spacing.nodeNode': '100',
        'elk.layered.spacing.edgeEdge': '100',
        'elk.layered.spacing.edgeNode': '100',
        'elk.separateConnectedComponents': 'false',
      }, // https://www.eclipse.org/elk/reference/algorithms.html
      children: nodes.map((node) => ({
        id: node.__data__.id,
        width: node.clientWidth,
        height: node.clientHeight,
      })),
      edges: Object.values(links).map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        sources: [edge.source],
        targets: [edge.target],
      })),
    };
    const { children } = await elk.layout(graph);
    if (!children) {
      throw new Error('Unable to create ELK positioning.');
    }
    const newNodes = nodes.map((node) => {
      const child = children.find((ch) => ch.id === node.id);
      return {
        ...node.__data__,
        fx: child?.x ?? 0,
        fy: child?.y ?? 0,
      };
    });
    return newNodes;
  } catch {
    return nodes.map((el) => el.__data__);
  }
};
