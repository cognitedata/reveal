import React from 'react';

import { DateFilterV2, MetadataFilterV2 } from '@data-exploration/containers';

import {
  AggregatedEventFilterV2,
  SourceFilter,
} from '@cognite/data-exploration';
import { CogniteEvent } from '@cognite/sdk/dist/src';
import { useList } from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '@data-exploration-lib/core';
import {
  transformNewFilterToOldFilter,
  useEventsMetadataKeysAggregateQuery,
  useEventsMetadataValuesAggregateQuery,
} from '@data-exploration-lib/domain-layer';

import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useFlagAdvancedFilters } from '../../hooks';
import {
  useEventsFilters,
  useFilterEmptyState,
  useResetEventsFilters,
} from '../../store';
import { SPECIFIC_INFO_CONTENT } from '../constants';
import { TempMultiSelectFix } from '../elements';

export const EventFilters = ({ ...rest }: Record<string, unknown>) => {
  const { t } = useTranslation();
  const [eventFilter, setEventFilter] = useEventsFilters();
  const resetEventFilters = useResetEventsFilters();
  const isFiltersEmpty = useFilterEmptyState('event');
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  const { data: metadataKeys = [] } = useEventsMetadataKeysAggregateQuery();

  const { data: items = [] } = useList<CogniteEvent>('events', {
    filter: transformNewFilterToOldFilter(eventFilter),
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title={t('EVENTS', 'Events')}
      infoContent={t('SPECIFIC_INFO_CONTENT', SPECIFIC_INFO_CONTENT)}
      hideResetButton={isFiltersEmpty}
      onResetClick={resetEventFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <AggregatedEventFilterV2
          field="type"
          filter={isAdvancedFiltersEnabled ? {} : eventFilter}
          setValue={(newValue) => {
            setEventFilter({ type: newValue });
          }}
          title={t('TYPES', 'Types')}
          value={eventFilter.type || []}
          isMulti={isAdvancedFiltersEnabled}
        />
        <DateFilterV2
          title={t('START_TIME', 'Start time')}
          value={eventFilter.startTime}
          setValue={(newDate) =>
            setEventFilter({
              startTime: newDate || undefined,
            })
          }
        />
        <DateFilterV2
          title={t('END_TIME', 'End time')}
          enableNull
          value={
            eventFilter.endTime && 'isNull' in eventFilter.endTime
              ? null
              : eventFilter.endTime
          }
          setValue={(newDate) =>
            setEventFilter({
              endTime:
                newDate === null ? { isNull: true } : newDate || undefined,
            })
          }
        />
        <AggregatedEventFilterV2
          field="subtype"
          filter={isAdvancedFiltersEnabled ? {} : eventFilter}
          setValue={(newValue) => {
            setEventFilter({ subtype: newValue });
          }}
          title={t('SUBTYPES', 'Subtypes')}
          value={eventFilter.subtype || []}
          isMulti={isAdvancedFiltersEnabled}
        />
        {/* <ByAssetFilter
          value={eventF.assetSubtreeIds?.map((el) => (el as InternalId).id)}
          setValue={(newValue) =>
            setFilter({
              ...filter,
              assetSubtreeIds: newValue?.map((id) => ({ id })),
            })
          }
        /> */}
        <SourceFilter
          items={items}
          value={eventFilter.sources}
          onChange={(newSources) =>
            setEventFilter({
              sources: newSources,
            })
          }
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
        />
        <MetadataFilterV2
          items={items}
          keys={metadataKeys}
          value={eventFilter.metadata}
          setValue={(newMetadata) =>
            setEventFilter({
              metadata: newMetadata,
            })
          }
          useAggregateMetadataValues={(metadataKey) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEventsMetadataValuesAggregateQuery({ metadataKey })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
