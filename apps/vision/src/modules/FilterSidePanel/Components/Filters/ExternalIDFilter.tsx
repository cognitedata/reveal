import React from 'react';
import { StringFilter } from '@cognite/data-exploration';
import { VisionFilterItemProps } from 'src/modules/FilterSidePanel/types';

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
