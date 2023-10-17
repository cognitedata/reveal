/**
 * Event Filter form
 */

import { useCallback, useMemo } from 'react';

import {
  TypeFilter,
  SubTypeFilter,
  MetadataFilter,
  SourceFilter,
  DataSetFilter,
  ExternalIdFilter,
  AssetSelectFilterOld,
} from '@data-exploration/containers';
import { omit } from 'lodash';

import { ChartEventFilters } from '@cognite/charts-lib';
import { Button, Collapse, Icon } from '@cognite/cogs.js';
import { Metadata } from '@cognite/sdk';

import { InternalEventsFilters } from '@data-exploration-lib/core';

import { ChartEventResults } from '../../models/event-results/types';
import {
  makeDefaultTranslations,
  translationKeys,
} from '../../utils/translations';
import {
  ExpandIcon,
  LoadingRow,
  SidebarChip,
  SidebarInnerBox,
  SidebarInnerCollapse,
} from '../Common/SidebarElements';

import { GhostMetadataFilter } from './elements';
import { useDebouncedDateRange } from './useDebouncedDateRange';
import { useDecoratedFilters } from './useDecoratedFilters';

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
  dateFrom: string;
  dateTo: string;
};

const EventFilterForm = ({
  eventData,
  eventFilter,
  setFilters,
  onShowEventResults,
  translations,
  dateFrom,
  dateTo,
}: Props) => {
  const { filters } = useMemo(() => eventFilter, [eventFilter]);
  const { isLoading, isError, adaptedFilters } = useDecoratedFilters(filters);
  const [debouncedTimeFrom, debouncedTimeTo] = useDebouncedDateRange(
    dateFrom,
    dateTo
  );
  const adaptedFiltersWithDateRange: InternalEventsFilters = useMemo(() => {
    return {
      ...adaptedFilters,
      startTime: { max: debouncedTimeTo },
      endTime: { min: debouncedTimeFrom },
    };
  }, [adaptedFilters, debouncedTimeFrom, debouncedTimeTo]);

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

  if (!eventData || eventData?.isLoading || isLoading || isError)
    return <LoadingRow lines={20} />;

  const { results } = eventData;

  if (!results) return <LoadingRow lines={20} />;

  return (
    <>
      <DataSetFilter.Common
        value={adaptedFilters.dataSetIds}
        onChange={(newFilters) => {
          const formatIds = newFilters?.map(({ value }) => ({
            id: value,
          }));
          handleUpdateFilters({
            ...filters,
            dataSetIds: formatIds,
          });
        }}
      />
      <AssetSelectFilterOld.Common
        value={adaptedFilters.assetSubtreeIds}
        onChange={(newFilters) => {
          handleUpdateFilters({
            ...filters,
            assetSubtreeIds: newFilters?.map(({ value }) => ({ id: value })),
          });
        }}
      />
      <TypeFilter.Event
        filter={adaptedFiltersWithDateRange}
        value={adaptedFilters.type}
        onChange={(newValue) => {
          handleUpdateFilters({
            ...filters,
            type: typeof newValue === 'string' ? newValue : newValue[0],
          });
        }}
      />

      <SubTypeFilter.Event
        filter={adaptedFiltersWithDateRange}
        value={adaptedFilters.subtype}
        onChange={(newValue) => {
          handleUpdateFilters({
            ...filters,
            subtype: typeof newValue === 'string' ? newValue : newValue[0],
          });
        }}
      />

      <SidebarInnerCollapse
        expandIcon={({ isActive }) => (
          <ExpandIcon $active={!!isActive} type="ChevronDownLarge" />
        )}
        ghost
      >
        <Collapse.Panel header={t['More filters']} key="panelFilterForm">
          <GhostMetadataFilter>
            <MetadataFilter.Events
              menuProps={{ placement: 'left' }}
              filter={adaptedFiltersWithDateRange}
              values={adaptedFilters.metadata}
              onChange={(newMetadata) => {
                if (newMetadata.length) {
                  handleUpdateFilters({
                    ...filters,
                    metadata: newMetadata.reduce<Metadata>(
                      (acc, { key, value }) => {
                        acc[key] = value;
                        return acc;
                      },
                      {}
                    ),
                  });
                } else {
                  handleUpdateFilters({
                    ...omit(filters, ['metadata']),
                  });
                }
              }}
            />
          </GhostMetadataFilter>

          <SourceFilter.Event
            filter={adaptedFilters}
            value={adaptedFilters.sources}
            onChange={(newSources) =>
              handleUpdateFilters({
                ...filters,
                source: newSources?.[0]?.value,
              })
            }
          />

          <ExternalIdFilter
            label={t['External ID']}
            value={adaptedFilters.externalIdPrefix}
            onChange={(idPrefix) => {
              handleUpdateFilters({
                ...filters,
                externalIdPrefix: idPrefix,
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
            size="small"
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
