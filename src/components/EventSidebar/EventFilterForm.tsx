/**
 * Event Filter form
 */

import { useCallback, useMemo } from 'react';
import { Button, Collapse, Icon, Popconfirm } from '@cognite/cogs.js';
import {
  AggregatedEventFilter,
  AggregatedFilter,
  ByAssetFilter,
  DataSetFilter,
  MetadataFilter,
  StringFilter,
} from '@cognite/data-exploration';
import { CogniteEvent, InternalId } from '@cognite/sdk';
import { Col, Row } from 'antd';
import { getTime } from 'date-fns';
import { useList } from '@cognite/sdk-react-query-hooks';

import { ChartEventFilters } from 'models/chart/types';
import {
  ExpandIcon,
  ReverseSwitch,
  SidebarChip,
  SidebarFooterActions,
  SidebarInnerBox,
  SidebarInnerCollapse,
} from 'components/Common/SidebarElements';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import { omit } from 'lodash';
import { transformNewFilterToOldFilter } from './helpers';
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
  startDate: string;
  endDate: string;
  eventFilters: ChartEventFilters;
  setFilters: (id: string, diff: any) => void;
  onDeleteEventFilter: (diff: any) => void;
  onDuplicateEventFilter: (id: string) => void;
  onToggleEventFilter: (id: string, visibility: boolean) => void;
  onShowEventResults: (diff: any) => void;
  translations?: typeof defaultTranslations;
};

const EventFilterForm = ({
  startDate,
  endDate,
  eventFilters,
  setFilters,
  onDeleteEventFilter,
  onDuplicateEventFilter,
  onToggleEventFilter,
  onShowEventResults,
  translations,
}: Props) => {
  const { filters } = useMemo(() => eventFilters, [eventFilters]);

  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const startTimeMin = getTime(new Date(startDate));
  const endTimeMax = getTime(new Date(endDate));

  const { data: items = [] } = useList<CogniteEvent>('events', {
    filter: transformNewFilterToOldFilter({
      ...filters,
      startTime: { min: startTimeMin },
      endTime: { max: endTimeMax },
    }),
    limit: 1000,
  });

  const handleUpdateFilters = useCallback(
    (diff: Partial<ChartEventFilters['filters']>) => {
      setFilters(eventFilters.id, diff);
    },
    [eventFilters.id, setFilters]
  );

  const isEventFilterValid = !!Object.keys(filters).length;

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
        filter={filters}
        setValue={(newValue) => {
          handleUpdateFilters({ ...filters, type: newValue });
        }}
        title={t.Type}
        value={filters.type}
      />
      <AggregatedEventFilter
        field="subtype"
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
              items={items}
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
            items={items}
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
          <SidebarChip icon="Events" size="medium">
            {isEventFilterValid && items.length > 0 ? items.length : '-'}
          </SidebarChip>
        </p>
      </SidebarInnerBox>
      <Button
        onClick={() => onShowEventResults(items)}
        disabled={!isEventFilterValid || !(items.length > 0)}
        block
      >
        {isEventFilterValid ? t['View results'] : t['Event filter is empty']}
        &nbsp; <Icon type="ArrowRight" />
      </Button>
      <SidebarFooterActions>
        <Row justify="space-between" align="middle">
          <Col span={8}>
            <Popconfirm
              maxWidth={390}
              content={`${t.Delete} "${eventFilters.name}"?`}
              onConfirm={() => onDeleteEventFilter(eventFilters.id)}
            >
              <Button type="ghost-danger" icon="Delete" aria-label="Delete" />
            </Popconfirm>
            <Popconfirm
              maxWidth={390}
              content={`${t.Duplicate} "${eventFilters.name}"?`}
              onConfirm={() => onDuplicateEventFilter(eventFilters.id)}
            >
              <Button type="ghost" icon="Duplicate" aria-label="Duplicate" />
            </Popconfirm>
          </Col>
          <Col>
            <ReverseSwitch
              name={`showEvents_${eventFilters.id}`}
              checked={eventFilters.visible}
              onChange={(val) => {
                onToggleEventFilter(eventFilters.id, val);
              }}
            >
              {t['Show / hide']}
            </ReverseSwitch>
          </Col>
        </Row>
      </SidebarFooterActions>
    </>
  );
};

EventFilterForm.translationKeys = translationKeys(defaultTranslations);
EventFilterForm.defaultTranslations = defaultTranslations;
EventFilterForm.translationNamespace = 'EventFilterForm';

export default EventFilterForm;
