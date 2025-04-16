/*!
 * Copyright 2025 Cognite AS
 */
import { useMemo } from 'react';
import { type CadModelOptions } from '..';
import { isSameModel } from '../../../utilities/isSameModel';
import { type ModelStyleGroup, type StyledModel } from '../types';
import { extractDefaultStyles } from './utils/extractDefaultStyles';

export function useJoinStylingGroups(
  models: CadModelOptions[],
  modelsMappedStyleGroups: ModelStyleGroup[],
  modelInstanceStyleGroups: ModelStyleGroup[]
): StyledModel[] {
  const modelsStyling = useMemo(() => {
    if (modelInstanceStyleGroups.length === 0 && modelsMappedStyleGroups.length === 0) {
      return extractDefaultStyles(models);
    }
    return models.map((model) => {
      const mappedStyleGroup =
        modelsMappedStyleGroups.find((typedModel) => isSameModel(typedModel.model, model))
          ?.styleGroup ?? [];
      const instanceStyleGroups = modelInstanceStyleGroups
        .filter((typedModel) => isSameModel(typedModel.model, model))
        .flatMap((typedModel) => typedModel.styleGroup);

      if (model.styling?.nodeGroups !== undefined) {
        instanceStyleGroups.push(...model.styling.nodeGroups);
      }

      return {
        model,
        styleGroups: [...mappedStyleGroup, ...instanceStyleGroups]
      };
    });
  }, [models, modelInstanceStyleGroups, modelsMappedStyleGroups]);

  return modelsStyling;
}
