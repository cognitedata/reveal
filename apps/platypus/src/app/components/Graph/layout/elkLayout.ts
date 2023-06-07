import ELK from 'elkjs/lib/elk.bundled.js'; // keep it as it is, otherwise the build fails

import { Node, Link } from '../GraphEngine';

export const getELKNodes = async (
  nodes: (Node & { width: number; height: number })[],
  links: Link[]
): Promise<Node[]> => {
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
      id: node.id,
      width: node.width,
      height: node.height,
      ...(node.fx && { x: node.fx }),
      ...(node.fy && { y: node.fy }),
    })),
    edges: links.map((edge) => ({
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
    const child = children.find((ch: { id: string }) => ch.id === node.id);
    return {
      ...node,
      fx: child?.x ?? 0,
      fy: child?.y ?? 0,
    };
  });
  return newNodes;
};
