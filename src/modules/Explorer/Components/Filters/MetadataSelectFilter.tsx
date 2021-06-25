import React, { useEffect } from 'react';
import { MetadataFilter } from '@cognite/data-exploration';
import { useList } from '@cognite/sdk-react-query-hooks';
import { FilterItemProps } from './filterItemProps';

export const MetadataSelectFilter = ({
  filter,
  setFilter,
}: FilterItemProps) => {
  const { data: items = [] } = useList('files', { filter, limit: 1000 });

  // set redux state to undefined when clear metadata using build in clear button(s)
  useEffect(() => {
    if (filter.metadata && Object.keys(filter.metadata).length === 0) {
      setFilter({
        ...filter,
        metadata: undefined,
      });
    }
  }, [filter.metadata]);

  return (
    <MetadataFilter
      items={items}
      value={filter.metadata}
      setValue={(newMetadata) => {
        setFilter({
          ...filter,
          metadata: newMetadata,
        });
      }}
    />
  );
};
