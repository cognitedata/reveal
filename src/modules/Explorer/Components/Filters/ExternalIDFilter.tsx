import React from 'react';
import { StringFilter } from '@cognite/data-exploration';
import { FilterItemProps } from './filterItemProps';

export const ExternalIdFilter = ({ filter, setFilter }: FilterItemProps) => (
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
