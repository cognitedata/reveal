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
  model.assignStyledNodeCollection(nodeCollection, appearance);
}
