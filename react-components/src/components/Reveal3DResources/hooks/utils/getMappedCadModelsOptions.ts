/*!
 * Copyright 2025 Cognite AS
 */
import { type NodeAppearance } from '@cognite/reveal';
import { type CadModelOptions } from '../../types';

export function getMappedCadModelsOptions(
  defaultMappedNodeAppearance: NodeAppearance | undefined,
  models: any[]
): CadModelOptions[] {
  if (defaultMappedNodeAppearance !== undefined) {
    return models;
  }

  return models.filter((model) => model.styling?.mapped !== undefined);
}
