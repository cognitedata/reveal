import {
  Cognite3DModel,
  NodeAppearance,
  NodeCollectionBase,
} from '@cognite/reveal';

export function assignOrUpdateStyledNodeCollection(
  model: Cognite3DModel,
  nodeCollection: NodeCollectionBase,
  appearance: NodeAppearance
): void {
  const hasCollection = model.styledNodeCollections
    .map((x) => x.nodeCollection)
    .includes(nodeCollection);
  if (hasCollection) {
    model.updateStyledNodeCollection(nodeCollection, appearance);
  } else {
    model.assignStyledNodeCollection(nodeCollection, appearance);
  }
}
