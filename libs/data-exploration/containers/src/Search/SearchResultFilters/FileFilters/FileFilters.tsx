import { BaseFilterCollapse } from '@data-exploration/components'; //??

import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
  useTranslation,
} from '@data-exploration-lib/core';

import {
  AuthorFilter,
  LabelFilter,
  MetadataFilter,
  SourceFilter,
  TypeFilter,
} from '../../../Filters';
import { TempMultiSelectFix } from '../elements';

export interface FileFilterProps extends FilterProps {
  enableDocumentLabelsFilter?: boolean;
}

// INFO: FileFilters is for documents.
export const FileFilters: React.FC<FileFilterProps> = ({
  enableDocumentLabelsFilter,
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const { t } = useTranslation();

  const documentFilter = filter.document;
  const isResetButtonVisible = hasObjectAnyProperty(documentFilter, [
    'labels',
    'metadata',
    'type',
    'author',
    'source',
  ]);

  return (
    <BaseFilterCollapse.Panel
      title={t('FILES', 'Files')}
      hideResetButton={!isResetButtonVisible}
      infoContent={t('SPECIFIC_INFO_CONTENT', SPECIFIC_INFO_CONTENT)}
      onResetClick={() => onResetFilterClick('document')}
      {...rest}
    >
      <TempMultiSelectFix>
        <MetadataFilter.Files
          query={query}
          filter={documentFilter}
          values={documentFilter.metadata}
          onChange={(newMetadata) => {
            onFilterChange('document', {
              metadata: newMetadata,
            });
          }}
        />
        <TypeFilter.File
          query={query}
          filter={documentFilter}
          value={documentFilter.type}
          onChange={(newFilters) =>
            onFilterChange('document', { type: newFilters })
          }
        />
        {enableDocumentLabelsFilter && (
          <LabelFilter.File
            query={query}
            filter={documentFilter}
            value={documentFilter.labels}
            onChange={(newFilters) =>
              onFilterChange('document', { labels: newFilters })
            }
          />
        )}

        <AuthorFilter.File
          query={query}
          filter={documentFilter}
          value={documentFilter.author}
          onChange={(newFilters) =>
            onFilterChange('document', { author: newFilters })
          }
        />

        <SourceFilter.File
          query={query}
          filter={documentFilter}
          value={documentFilter.source}
          onChange={(newSources) =>
            onFilterChange('document', {
              source: newSources,
            })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
