/**
 * Event Filter form
 */

import { useCallback, useMemo } from 'react';

import {
  ExpandIcon,
  LoadingRow,
  SidebarChip,
  SidebarInnerBox,
  SidebarInnerCollapse,
} from '@charts-app/components/Common/SidebarElements';
import { ChartEventFilters } from '@charts-app/models/chart/types';
import { ChartEventResults } from '@charts-app/models/event-results/types';
import {
  makeDefaultTranslations,
  translationKeys,
} from '@charts-app/utils/translations';
import { omit } from 'lodash';

import { Button, Collapse, Icon } from '@cognite/cogs.js';
import {
  AggregatedEventFilter,
  AggregatedFilter,
  ByAssetFilter,
  DataSetFilter,
  MetadataFilter,
  StringFilter,
} from '@cognite/data-exploration';
import { InternalId } from '@cognite/sdk';

import { GhostMetadataFilter } from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Equipment tag (asset ID)',
  'Type',
  'Sub-type',
  'More filters',
  'Source',
  'External ID',
  'Number of events',
  'View results',
  'Delete',
  'Duplicate',
  'Show / hide',
  'Event filter is empty'
);

type Props = {
  eventData: ChartEventResults | undefined;
  eventFilter: ChartEventFilters;
  setFilters: (id: string, diff: any) => void;
  onShowEventResults: (id: string) => void;
  translations?: typeof defaultTranslations;
};

const EventFilterForm = ({
  eventData,
  eventFilter,
  setFilters,
  onShowEventResults,
  translations,
}: Props) => {
  const { filters } = useMemo(() => eventFilter, [eventFilter]);

  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const handleUpdateFilters = useCallback(
    (diff: Partial<ChartEventFilters['filters']>) => {
      setFilters(eventFilter.id, diff);
    },
    [eventFilter.id, setFilters]
  );

  const isEventFilterValid = !!Object.keys(filters).length;

  if (!eventData || eventData?.isLoading) return <LoadingRow lines={20} />;

  const { results } = eventData;

  if (!results) return <LoadingRow lines={20} />;

  return (
    <>
      <ByAssetFilter
        title={t['Equipment tag (asset ID)']}
        value={filters.assetSubtreeIds?.map((el) => (el as InternalId).id)}
        setValue={(newValue) =>
          handleUpdateFilters({
            ...filters,
            assetSubtreeIds: newValue?.map((id) => ({ id })),
          })
        }
      />
      <AggregatedEventFilter
        field="type"
        // eslint-disable-next-line
        // @ts-ignore todo(DEGR-2397) fix dataSetIds & assetSubtreeIds filters
        filter={filters}
        setValue={(newValue) => {
          handleUpdateFilters({ ...filters, type: newValue });
        }}
        title={t.Type}
        value={filters.type}
      />
      <AggregatedEventFilter
        field="subtype"
        // eslint-disable-next-line
        // @ts-ignore todo(DEGR-2397) fix dataSetIds & assetSubtreeIds filters
        filter={filters}
        setValue={(newValue) => {
          handleUpdateFilters({ ...filters, subtype: newValue });
        }}
        title={t['Sub-type']}
        value={filters.subtype}
      />

      <SidebarInnerCollapse
        expandIcon={({ isActive }) => (
          <ExpandIcon $active={!!isActive} type="ChevronDownLarge" />
        )}
        ghost
      >
        <Collapse.Panel header={t['More filters']} key="panelFilterForm">
          <GhostMetadataFilter>
            <MetadataFilter
              items={results}
              value={filters.metadata}
              setValue={(newMetadata) => {
                if (Object.keys(newMetadata || {}).length) {
                  handleUpdateFilters({
                    ...filters,
                    metadata: newMetadata,
                  });
                } else {
                  handleUpdateFilters({
                    ...omit(filters, ['metadata']),
                  });
                }
              }}
            />
          </GhostMetadataFilter>

          <AggregatedFilter
            title={t.Source}
            items={results}
            aggregator="source"
            value={filters.source}
            setValue={(newSource) =>
              handleUpdateFilters({
                ...filters,
                source: newSource,
              })
            }
          />

          <DataSetFilter
            resourceType="event"
            value={filters.dataSetIds?.map((id) => id)}
            setValue={(newIds) => {
              const formatIds = newIds?.map(({ id }: any) => ({ id }));
              handleUpdateFilters({
                ...filters,
                dataSetIds: formatIds,
              });
            }}
          />

          <StringFilter
            title={t['External ID']}
            value={filters.externalIdPrefix}
            setValue={(newExternalId) => {
              handleUpdateFilters({
                ...filters,
                externalIdPrefix: newExternalId,
              });
            }}
          />
        </Collapse.Panel>
      </SidebarInnerCollapse>
      <SidebarInnerBox>
        <p>
          {t['Number of events']}:
          <br />
          <SidebarChip
            icon="Events"
            size="medium"
            label={
              isEventFilterValid && results.length > 0
                ? `${results.length}`
                : '-'
            }
          />
        </p>
      </SidebarInnerBox>
      <Button
        onClick={() => onShowEventResults(eventData.id)}
        disabled={!isEventFilterValid || !(results.length > 0)}
        style={{ display: 'block' }}
      >
        {isEventFilterValid ? t['View results'] : t['Event filter is empty']}
        &nbsp; <Icon type="ArrowRight" />
      </Button>
    </>
  );
};

EventFilterForm.translationKeys = translationKeys(defaultTranslations);
EventFilterForm.defaultTranslations = defaultTranslations;
EventFilterForm.translationNamespace = 'EventFilterForm';

export default EventFilterForm;
