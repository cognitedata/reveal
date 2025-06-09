import { type LabelFilter } from '@cognite/sdk';
import { isEmpty } from 'lodash';

export const createLabelFilter = (labels?: string[]): LabelFilter | undefined => {
  if (labels === undefined || isEmpty(labels)) {
    return undefined;
  }

  return {
    containsAny: labels.map((label) => ({ externalId: label }))
  };
};
