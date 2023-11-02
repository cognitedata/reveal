import { PreviewFilterDropdown } from '@data-exploration/components';

import { FileInfo } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';

import {
  InternalDocumentFilter,
  InternalFilesFilters,
  useTranslation,
} from '@data-exploration-lib/core';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

import {
  LabelFilter,
  MetadataFilter,
  SourceFilter,
  TypeFilter,
} from '../../../Filters';
import { AggregatedFilterV2, MetadataFilterV2 } from '../../../Temp';

interface FileFiltersProps {
  filter: InternalFilesFilters;
  onFilterChange: (newValue: InternalFilesFilters) => void;
}

export const FileTableFiltersFile = ({
  filter,
  onFilterChange,
}: FileFiltersProps) => {
  const { t } = useTranslation();

  const { data: items = [] } = useList<FileInfo>('files', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <AggregatedFilterV2
        items={items}
        aggregator="mimeType"
        title={t('MIME_TYPE', 'Mime type')}
        value={filter.mimeType}
        setValue={(newValue) => onFilterChange({ mimeType: newValue })}
      />
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={(newValue) => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

interface DocumentFiltersProps {
  filter: InternalDocumentFilter;
  onFilterChange: (newValue: InternalDocumentFilter) => void;
}

export const FileTableFiltersDocument = ({
  filter,
  onFilterChange,
}: DocumentFiltersProps) => {
  return (
    <PreviewFilterDropdown>
      <LabelFilter.File
        filter={filter}
        value={filter.labels}
        onChange={(newFilters) => onFilterChange({ labels: newFilters })}
        menuPortalTarget={document.body}
      />
      <SourceFilter.File
        filter={filter}
        value={filter.source}
        onChange={(newSources) =>
          onFilterChange({
            source: newSources,
          })
        }
        menuPortalTarget={document.body}
      />
      <TypeFilter.File
        filter={filter}
        value={filter.type}
        onChange={(newValue) => onFilterChange({ type: newValue as any })}
        menuPortalTarget={document.body}
      />
      <MetadataFilter.Files
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
        menuPortalTarget={document.body}
      />
    </PreviewFilterDropdown>
  );
};
