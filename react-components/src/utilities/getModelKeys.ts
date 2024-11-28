/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions, type DataSourceType } from '@cognite/reveal';
import { isClassicIdentifier, isDMIdentifier } from '../components';

export const getModelKeys = (models: Array<AddModelOptions<DataSourceType>>): string[] => {
  return models.map((model) => {
    if (isClassicIdentifier(model)) {
      return `${model.modelId}/${model.revisionId}`;
    } else if (isDMIdentifier(model)) {
      return `${model.revisionExternalId}/${model.revisionSpace}`;
    }
    return '';
  });
};
