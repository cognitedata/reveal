import React, { useEffect } from 'react';

import { MetadataFilter } from '@cognite/data-exploration';
import { FileInfo } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';

import { VisionFilterItemProps } from '../../types';

export const MetadataSelectFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => {
  const { data: items = [] } = useList<FileInfo>('files', {
    filter,
    limit: 1000,
  });

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
