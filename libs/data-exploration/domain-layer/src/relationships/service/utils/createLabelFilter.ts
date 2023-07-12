import isEmpty from 'lodash/isEmpty';

import { LabelFilter } from '@cognite/sdk';

export const createLabelFilter = (
  labels?: string[]
): LabelFilter | undefined => {
  if (!labels || isEmpty(labels)) {
    return undefined;
  }

  return {
    containsAny: labels.map((label) => ({ externalId: label })),
  };
};
