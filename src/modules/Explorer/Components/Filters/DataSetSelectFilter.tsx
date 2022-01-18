import React from 'react';
import { DataSetFilter } from '@cognite/data-exploration';
import { VisionFilterItemProps } from './types';

// ToDo(VIS-306): File count in DataSetFilter should count only the files with valid mime type
export const DataSetSelectFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => (
  <DataSetFilter
    resourceType="file"
    value={filter.dataSetIds}
    setValue={(newIds) =>
      setFilter({
        ...filter,
        dataSetIds: newIds,
      })
    }
  />
);
