import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useFileFilters } from 'app/store/filter';
import {
  AggregatedFilter,
  DateFilter,
  LabelFilter,
  MetadataFilter,
  StringFilter,
} from '@cognite/data-exploration';

export const FileFilters = ({ ...rest }) => {
  const [fileFilter, setFileFilter] = useFileFilters();

  const { data: items = [] } = useList('files', {
    filter: fileFilter,
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel title="Files" {...rest}>
      <AggregatedFilter
        items={items}
        aggregator="mimeType"
        title="Mime type"
        value={fileFilter.mimeType}
        setValue={newValue => setFileFilter({ mimeType: newValue })}
      />
      <DateFilter
        title="Source Modified Time"
        value={fileFilter.sourceModifiedTime}
        setValue={newDate =>
          setFileFilter({
            sourceModifiedTime: newDate || undefined,
          })
        }
      />
      <LabelFilter
        resourceType="file"
        value={((fileFilter as any).labels || { containsAny: [] }).containsAny}
        setValue={newFilters =>
          setFileFilter({
            labels: newFilters ? { containsAny: newFilters } : undefined,
          })
        }
      />

      <DateFilter
        title="Uploaded Time"
        value={fileFilter.uploadedTime}
        setValue={newDate =>
          setFileFilter({
            uploadedTime: newDate || undefined,
          })
        }
      />
      <StringFilter
        title="Directory prefix"
        value={(fileFilter as any).directoryPrefix}
        setValue={newPrefix =>
          setFileFilter({
            // @ts-ignore
            directoryPrefix: newPrefix,
          })
        }
      />
      <AggregatedFilter
        title="Source"
        items={items}
        aggregator="source"
        value={fileFilter.source}
        setValue={newSource =>
          setFileFilter({
            source: newSource,
          })
        }
      />
      <MetadataFilter
        items={items}
        value={fileFilter.metadata}
        setValue={newMetadata =>
          setFileFilter({
            metadata: newMetadata,
          })
        }
      />

      <DateFilter
        title="Source Created Time"
        value={fileFilter.sourceCreatedTime}
        setValue={newDate =>
          setFileFilter({
            sourceCreatedTime: newDate || undefined,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
