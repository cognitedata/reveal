import {
  Cognite3DModel,
  NodeAppearance,
  NodeCollection,
} from '@cognite/reveal';

export function assignOrUpdateStyledNodeCollection(
  model: Cognite3DModel,
  nodeCollection: NodeCollection,
  appearance: NodeAppearance
): void {
  model.assignStyledNodeCollection(nodeCollection, appearance);
}
