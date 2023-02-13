import { Chip, Flex } from '@cognite/cogs.js';
import { MatchingLabels } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import { capitalizeFirstLetter } from '../../../utils';

export const MatchingLabelsComponent: React.FC<MatchingLabels> = ({
  exact,
  fuzzy,
  partial,
}) => {
  return (
    <Flex gap={4}>
      {!isEmpty(exact) && (
        <Chip
          label={`Exact match: ${exact
            .map((item) => capitalizeFirstLetter(item))
            .join(', ')}`}
          size="x-small"
          icon="MagicWand"
          type={'success'}
        />
      )}

      {!isEmpty(partial) && (
        <Chip
          label={`Partial match: ${partial
            .map((item) => capitalizeFirstLetter(item))
            .join(', ')}`}
          size="x-small"
        />
      )}

      {!isEmpty(fuzzy) && (
        <Chip
          label={`Fuzzy match: ${fuzzy
            .map((item) => capitalizeFirstLetter(item))
            .join(', ')}`}
          size="x-small"
        />
      )}
    </Flex>
  );
};
