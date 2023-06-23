import React from 'react';

import { VisionFilterItemProps } from '@vision/modules/FilterSidePanel/types';

import { StringFilter } from '@cognite/data-exploration';

export const ExternalIdFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => (
  <StringFilter
    title="External ID"
    value={filter.externalIdPrefix || ''}
    setValue={(newExternalId) =>
      setFilter({
        ...filter,
        externalIdPrefix: newExternalId,
      })
    }
  />
);
