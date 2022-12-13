import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useFileFilters,
  useFilterEmptyState,
  useResetFileFilters,
} from '@data-exploration-app/store/filter';
import {
  AggregatedFilterV2,
  DateFilterV2,
  LabelFilterV2,
  MetadataFilterV2,
  StringFilterV2,
  transformNewFilterToOldFilter,
} from '@cognite/data-exploration';
import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';

export const FileFilters = ({ ...rest }) => {
  const [fileFilter, setFileFilter] = useFileFilters();
  const resetFileFilters = useResetFileFilters();
  const isFiltersEmpty = useFilterEmptyState('file');

  const { data: items = [] } = useList<any>('files', {
    filter: transformNewFilterToOldFilter(fileFilter),
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title="Files"
      infoContent={SPECIFIC_INFO_CONTENT}
      hideResetButton={isFiltersEmpty}
      onResetClick={resetFileFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <AggregatedFilterV2
          items={items}
          aggregator="mimeType"
          title="Mime type"
          value={fileFilter.mimeType}
          setValue={(newValue) => setFileFilter({ mimeType: newValue })}
        />
        <DateFilterV2
          title="Source Modified Time"
          value={fileFilter.sourceModifiedTime}
          setValue={(newDate) =>
            setFileFilter({
              sourceModifiedTime: newDate || undefined,
            })
          }
        />
        <LabelFilterV2
          resourceType="file"
          value={fileFilter.labels}
          setValue={(newFilters) =>
            setFileFilter({
              labels: newFilters,
            })
          }
        />

        <DateFilterV2
          title="Uploaded Time"
          value={fileFilter.uploadedTime}
          setValue={(newDate) =>
            setFileFilter({
              uploadedTime: newDate || undefined,
            })
          }
        />
        <StringFilterV2
          title="Directory prefix"
          value={(fileFilter as any).directoryPrefix}
          setValue={(newPrefix) =>
            setFileFilter({
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              directoryPrefix: newPrefix,
            })
          }
        />
        <AggregatedFilterV2
          title="Source"
          items={items}
          aggregator="source"
          value={fileFilter.source}
          setValue={(newSource) =>
            setFileFilter({
              source: newSource,
            })
          }
        />
        <MetadataFilterV2
          items={items}
          value={fileFilter.metadata}
          setValue={(newMetadata) =>
            setFileFilter({
              metadata: newMetadata,
            })
          }
        />

        <DateFilterV2
          title="Source Created Time"
          value={fileFilter.sourceCreatedTime}
          setValue={(newDate) =>
            setFileFilter({
              sourceCreatedTime: newDate || undefined,
            })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
