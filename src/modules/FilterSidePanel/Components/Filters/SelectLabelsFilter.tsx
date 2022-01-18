import React from 'react';
import { LabelFilter } from '@cognite/data-exploration';
import { VisionFilterItemProps } from 'src/modules/FilterSidePanel/types';

export const SelectLabelsFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => (
  <LabelFilter
    resourceType="file"
    value={((filter as any).labels || { containsAll: [] }).containsAll}
    setValue={(newFilters) =>
      setFilter({
        ...filter,
        labels: newFilters ? { containsAll: newFilters } : undefined,
      })
    }
  />
);
