import { BaseFilterCollapse } from '@data-exploration/components'; //??

import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
  useTranslation,
} from '@data-exploration-lib/core';

import {
  DateFilter,
  MetadataFilter,
  SourceFilter,
  SubTypeFilter,
  TypeFilter,
} from '../../../Filters';
import { TempMultiSelectFix } from '../elements';

export const EventFilters: React.FC<FilterProps> = ({
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const { t } = useTranslation();

  const eventFilter = filter.event;
  const isResetButtonVisible = hasObjectAnyProperty(eventFilter, [
    'sources',
    'metadata',
    'startTime',
    'endTime',
    'subtype',
    'type',
  ]);

  return (
    <BaseFilterCollapse.Panel
      title={t('EVENTS', 'Events')}
      hideResetButton={!isResetButtonVisible}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('event')}
      {...rest}
    >
      <TempMultiSelectFix>
        <TypeFilter.Event
          query={query}
          filter={eventFilter}
          value={eventFilter.type}
          onChange={(newFilters) =>
            onFilterChange('event', { type: newFilters })
          }
        />

        <DateFilter.StartTime
          value={eventFilter.startTime}
          onChange={(newFilters) =>
            onFilterChange('event', { startTime: newFilters || undefined })
          }
        />
        <DateFilter.EndTime
          value={
            eventFilter.endTime && 'isNull' in eventFilter.endTime
              ? null
              : eventFilter.endTime
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
          filter={eventFilter}
          value={eventFilter.subtype}
          onChange={(newFilters) =>
            onFilterChange('event', { subtype: newFilters })
          }
        />

        <SourceFilter.Event
          query={query}
          filter={eventFilter}
          value={eventFilter.sources}
          onChange={(newSources) =>
            onFilterChange('event', {
              sources: newSources,
            })
          }
        />
        <MetadataFilter.Events
          query={query}
          filter={eventFilter}
          values={eventFilter.metadata}
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
