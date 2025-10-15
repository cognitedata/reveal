import { type LabelFilter } from '@cognite/sdk';
import { isEmpty } from 'lodash-es';

export const createLabelFilter = (labels?: string[]): LabelFilter | undefined => {
  if (labels === undefined || isEmpty(labels)) {
    return undefined;
  }

  return {
    containsAny: labels.map((label) => ({ externalId: label }))
  };
};
