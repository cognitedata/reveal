import { Label } from '@cognite/sdk/dist/src';

import { MatchingLabels } from '../types';

import { isExactMatch } from './extractMatchingLabels';

export const extractMatchingLabelsFromCogniteLabels = (
  value: Label[],
  query: string,
  matchers: MatchingLabels
) => {
  value.forEach((childValue) => {
    if (isExactMatch(childValue.externalId, query)) {
      matchers.exact.push(`Label`);
    }
  });
};
