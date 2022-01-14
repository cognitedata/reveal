import { Node } from '../Graph';

export const getFitContentXYK = <T>(
  nodesForCalculation: d3.Selection<
    Element,
    Node & T,
    HTMLDivElement | null,
    unknown
  >,
  containerWidth: number,
  containerHeight: number
) => {
  const initialNodes = (
    nodesForCalculation.nodes() as (Element & { __data__: Node & T })[]
  )
    .filter(
      (el) =>
        el.__data__ &&
        el.__data__.x !== undefined &&
        el.__data__.y !== undefined
    )
    .map((node) => ({
      id: node.id,
      width: node.clientWidth,
      height: node.clientHeight,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      x: node.__data__.x!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      y: node.__data__.y!,
    }));

  if (initialNodes.length === 0) {
    throw new Error('Unable to fit content');
  }
  if (initialNodes.length === 1) {
    return { x: 0, y: 0, k: 1 };
  }

  const width = containerWidth;
  const height = containerHeight;

  // sort the nodes by x from lowest to highest
  initialNodes.sort((a, b) => a.x - b.x);
  const minXNode = initialNodes[0]; // left most node
  const maxXNode = initialNodes[initialNodes.length - 1]; // right most node

  // sort the nodes by y from lowest to highest
  initialNodes.sort((a, b) => a.y - b.y);
  const minYNode = initialNodes[0]; // top node
  const maxYNode = initialNodes[initialNodes.length - 1]; // bottom node

  const newX = -minXNode.x; // move backwards by x to origin
  const newY = -minYNode.y; // move backwards by y to origin

  // since the box's width/height is not "scaling" when zooming in/out, avoid it in the scale calculation
  // scale => bounding box of the nodes / viewport width - max node's width
  const scaleX = (maxXNode.x - minXNode.x) / (width - maxXNode.width);
  // scale => bounding box of the nodes / viewport height - max node's height
  const scaleY = (maxYNode.y - minYNode.y) / (height - maxYNode.height);

  // take the max of the scales
  const scaleK = Math.max(scaleX, scaleY);

  // set zoom
  return {
    x: newX / scaleK,
    y: newY / scaleK,
    k: 1 / scaleK,
  };
};
