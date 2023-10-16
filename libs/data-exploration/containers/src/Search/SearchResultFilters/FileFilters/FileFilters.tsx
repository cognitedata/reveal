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
  defaultFilter = {},
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const { t } = useTranslation();

  const documentFilter = filter.document;
  const defaultDocumentFilter = defaultFilter.document;
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
          defaultFilter={defaultDocumentFilter}
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
          defaultFilter={defaultDocumentFilter}
          value={documentFilter.type}
          onChange={(newFilters) =>
            onFilterChange('document', { type: newFilters })
          }
          addNilOption
        />
        {enableDocumentLabelsFilter && (
          <LabelFilter.File
            query={query}
            filter={documentFilter}
            defaultFilter={defaultDocumentFilter}
            value={documentFilter.labels}
            onChange={(newFilters) =>
              onFilterChange('document', { labels: newFilters })
            }
            addNilOption
          />
        )}

        <AuthorFilter.File
          query={query}
          filter={documentFilter}
          defaultFilter={defaultDocumentFilter}
          value={documentFilter.author}
          onChange={(newFilters) =>
            onFilterChange('document', { author: newFilters })
          }
          addNilOption
        />

        <SourceFilter.File
          query={query}
          filter={documentFilter}
          defaultFilter={defaultDocumentFilter}
          value={documentFilter.source}
          onChange={(newSources) =>
            onFilterChange('document', {
              source: newSources,
            })
          }
          addNilOption
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
