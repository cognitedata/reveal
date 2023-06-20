import {
  CogniteCadModel,
  NodeAppearance,
  NodeCollection,
} from '@cognite/reveal';

export function assignOrUpdateStyledNodeCollection(
  model: CogniteCadModel,
  nodeCollection: NodeCollection,
  appearance: NodeAppearance
): void {
  model.assignStyledNodeCollection(nodeCollection, appearance);
}
