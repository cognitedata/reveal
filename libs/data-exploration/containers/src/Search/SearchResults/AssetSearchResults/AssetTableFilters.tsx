import React from 'react';

import { PreviewFilterDropdown } from '@data-exploration/components';

import { InternalAssetFilters } from '@data-exploration-lib/core';

import { LabelFilter, MetadataFilter, SourceFilter } from '../../../Filters';

interface Props {
  filter: InternalAssetFilters;
  onFilterChange: (newValue: InternalAssetFilters) => void;
}

export const AssetTableFilters: React.FC<Props> = ({
  filter,
  onFilterChange,
}) => {
  return (
    <PreviewFilterDropdown>
      <LabelFilter.Asset
        filter={filter}
        value={filter.labels}
        onChange={(newFilters) => onFilterChange({ labels: newFilters })}
        addNilOption
        menuPortalTarget={document.body}
      />
      <SourceFilter.Asset
        filter={filter}
        value={filter.sources}
        onChange={(newSources) =>
          onFilterChange({
            sources: newSources,
          })
        }
        menuPortalTarget={document.body}
      />
      <MetadataFilter.Assets
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};
