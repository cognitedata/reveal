import { type AddModelOptions, type DataSourceType } from '@cognite/reveal';

import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import { type AddImage360CollectionDatamodelsOptions } from '../components/Reveal3DResources/types';

export const getModelKeys = (
  models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>
): string[] => {
  return models.map((model) => {
    if (isClassicIdentifier(model)) {
      return `${model.modelId}/${model.revisionId}`;
    } else if (isDM3DModelIdentifier(model)) {
      return `${model.revisionExternalId}/${model.revisionSpace}`;
    }
    return '';
  });
};
