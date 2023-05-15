import {
  FilterProps,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import {
  DateFilter,
  MetadataFilter,
  SourceFilter,
  SubTypeFilter,
  TypeFilter,
} from '../../../Filters';

export const EventFilters: React.FC<FilterProps> = ({
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  return (
    <BaseFilterCollapse.Panel
      title="Events"
      hideResetButton={isObjectEmpty(filter.event as any)}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('event')}
      {...rest}
    >
      <TempMultiSelectFix>
        <TypeFilter.Event
          query={query}
          filter={filter.event}
          value={filter.event.type}
          onChange={(newFilters) =>
            onFilterChange('event', { type: newFilters })
          }
        />

        <DateFilter.StartTime
          value={filter.event.startTime}
          onChange={(newFilters) =>
            onFilterChange('event', { startTime: newFilters || undefined })
          }
        />
        <DateFilter.EndTime
          value={
            filter.event.endTime && 'isNull' in filter.event.endTime
              ? null
              : filter.event.endTime
          }
          onChange={(newDate) =>
            onFilterChange('event', {
              endTime:
                newDate === null ? { isNull: true } : newDate || undefined,
            })
          }
        />

        <SubTypeFilter.Event
          query={query}
          filter={filter.event}
          value={filter.event.subtype}
          onChange={(newFilters) =>
            onFilterChange('event', { subtype: newFilters })
          }
        />

        <SourceFilter.Event
          query={query}
          filter={filter.event}
          value={filter.event.sources}
          onChange={(newSources) =>
            onFilterChange('event', {
              sources: newSources,
            })
          }
        />
        <MetadataFilter.Events
          query={query}
          filter={filter.event}
          values={filter.event.metadata}
          onChange={(newMetadata) => {
            onFilterChange('event', {
              metadata: newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
