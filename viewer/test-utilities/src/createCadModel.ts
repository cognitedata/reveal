/*!
 * Copyright 2021 Cognite AS
 */
import { CogniteCadModel } from '../../packages/cad-model';
import { NodesApiClient, NodesLocalClient } from '../../packages/nodes-api';

import { createCadNode } from './createCadNode';

export function createCadModel(
  modelId: number,
  revisionId: number,
  depth: number = 3,
  children: number = 3,
  nodesApiClient?: NodesApiClient
): CogniteCadModel {
  const cadNode = createCadNode(depth, children);
  nodesApiClient = nodesApiClient ?? new NodesLocalClient();
  const model = new CogniteCadModel(modelId, revisionId, cadNode, nodesApiClient);

  return model;
}
