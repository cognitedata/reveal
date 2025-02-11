/*!
 * Copyright 2025 Cognite AS
 */
import { type CadModelOptions } from '../..';
import { type StyledModel } from '../../types';

export function extractDefaultStyles(typedModels: CadModelOptions[]): StyledModel[] {
  return typedModels.map((model) => {
    return {
      model,
      styleGroups: []
    };
  });
}
