import { LabelDefinition, LabelDefinitionFilterRequest } from '@cognite/sdk';

import { getLabelsByQuery } from './getLabelsByQuery';

export const getAllLabelsByQuery = async (
  queries?: LabelDefinitionFilterRequest[]
) => {
  const results = await Promise.all(
    (queries || []).map(async (query) => {
      return getLabelsByQuery(query);
    })
  );

  return results.reduce((accumulator, item) => {
    return [...accumulator, ...item.items];
  }, [] as LabelDefinition[]);
};
