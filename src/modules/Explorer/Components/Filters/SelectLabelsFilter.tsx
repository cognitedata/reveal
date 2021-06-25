import React from 'react';
import { LabelFilter } from '@cognite/data-exploration';
import { FilterItemProps } from './filterItemProps';

export const SelectLabelsFilter = ({ filter, setFilter }: FilterItemProps) => (
  <LabelFilter
    resourceType="file"
    value={((filter as any).labels || { containsAny: [] }).containsAny}
    setValue={(newFilters) =>
      setFilter({
        ...filter,
        labels: newFilters ? { containsAny: newFilters } : undefined,
      })
    }
  />
);
