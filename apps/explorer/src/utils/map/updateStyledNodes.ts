import {
  CadIntersection,
  Cognite3DModel,
  Cognite3DViewer,
  DefaultNodeAppearance,
  IndexSet,
  NumericRange,
  TreeIndexNodeCollection,
} from '@cognite/reveal';

export const updateStyledNodes = async (
  viewer: Cognite3DViewer | undefined,
  event: { offsetX: any; offsetY: any },
  model: Cognite3DModel
) => {
  if (!viewer) return undefined;

  const intersection = await viewer
    .getIntersectionFromPixel(event.offsetX, event.offsetY)
    .then((res) => res as CadIntersection);
  if (intersection) {
    const myNodes = new TreeIndexNodeCollection();
    const styledNodes = model.styledNodeCollections;
    // determines if we should assign highlights to nodes
    let updateStyles = true;

    if (styledNodes[0]) {
      // if there are styled nodes
      const styledIndexSet = styledNodes[0].nodeCollection.getIndexSet();
      const styledNodeTreeIndex = styledIndexSet.rootNode
        ? styledIndexSet.rootNode.range.from
        : undefined;

      // reset
      model.removeAllStyledNodeCollections();
      if (styledNodeTreeIndex === intersection.treeIndex) {
        updateStyles = false;
      }
    }

    if (updateStyles) {
      model.assignStyledNodeCollection(
        myNodes,
        DefaultNodeAppearance.Highlighted
      );
      myNodes.updateSet(
        new IndexSet(new NumericRange(intersection.treeIndex, 1))
      );

      return intersection.treeIndex;
    }
    return undefined;
  }
  return undefined;
};
