import { Label } from '@cognite/cogs.js';
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
    <>
      {!isEmpty(exact) && (
        <Label size="small" icon="MagicWand" variant={'success'}>
          {`Exact match: ${exact
            .map((item) => capitalizeFirstLetter(item))
            .join(', ')}`}
        </Label>
      )}

      {!isEmpty(partial) && (
        <Label size="small" variant={'unknown'}>
          {`Partial match: ${partial
            .map((item) => capitalizeFirstLetter(item))
            .join(', ')}`}
        </Label>
      )}

      {!isEmpty(fuzzy) && (
        <Label size="small" variant={'unknown'}>
          {`Fuzzy match: ${fuzzy
            .map((item) => capitalizeFirstLetter(item))
            .join(', ')}`}
        </Label>
      )}
    </>
  );
};
