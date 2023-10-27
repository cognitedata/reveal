import React, { useMemo, useState } from 'react';

import styled from 'styled-components';

import { Table, Typography, Widget } from '@fdx/components';
import { useInstanceDirectRelationshipQuery } from '@fdx/services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { useTimeseriesByIdsQuery } from '@fdx/services/instances/timeseries/queries/useTimeseriesByIdsQuery';
import { EMPTY_ARRAY } from '@fdx/shared/constants/object';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { ValueByField } from '@fdx/shared/types/filters';
import { matchSorter } from 'match-sorter';

import { Button, InputExp, SegmentedControl } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';
import { ExternalId } from '@cognite/sdk/dist/src';

import { InstancePreview } from '../../../../preview/InstancePreview';
import { RelationshipFilter } from '../../Filters';
import { RelationshipEdgesProps } from '../../RelationshipEdgesWidget';

export const TimeseriesRelationshipEdgesExpanded: React.FC<
  RelationshipEdgesProps
> = ({ type }) => {
  const { t } = useTranslation();
  const { toTimeseriesPage } = useNavigation();
  const [view, setView] = useState<'Grid' | 'List'>('Grid');
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [filterState, setFilterState] = useState<ValueByField | undefined>(
    undefined
  );

  const { data: ids, status } =
    useInstanceDirectRelationshipQuery<(ExternalId | null)[]>(type);
  const { data } = useTimeseriesByIdsQuery(ids);

  const transformedData = useMemo(() => {
    return matchSorter(data || [], inputValue || '', {
      keys: ['name', 'description', 'externalId'],
    });
  }, [data, inputValue]);

  const renderContent = () => {
    if (view === 'Grid') {
      return (transformedData || [])?.map((item) => {
        if (!item) {
          return null;
        }

        return (
          <Container>
            <Content>
              <div>
                <Typography.Title size="small">
                  {item.name || item.externalId}
                </Typography.Title>

                <Typography.Body>{item.description}</Typography.Body>
              </div>

              <InstancePreview.Timeseries
                disabled={!item.externalId}
                id={item.externalId!}
              >
                <Button
                  type="ghost-accent"
                  icon="ArrowUpRight"
                  onClick={() => toTimeseriesPage(item.externalId)}
                >
                  {t('GENERAL_OPEN')}
                </Button>
              </InstancePreview.Timeseries>
            </Content>

            {item.externalId && (
              <TimeseriesChart
                timeseries={{ externalId: item.externalId }}
                hideActions
                styles={{ backgroundColor: 'white' }}
              />
            )}
          </Container>
        );
      });
    }

    return (
      <Table
        id="timeseries-table"
        data={transformedData || EMPTY_ARRAY}
        columns={columns}
        onRowClick={(row) => toTimeseriesPage(row.externalId)}
      />
    );
  };

  return (
    <Widget expanded>
      <Widget.Header>
        <InputExp
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('PROPERTIES_WIDGET_SEARCH_INPUT_PLACEHOLDER')}
          icon="Search"
          clearable
        />
        <RelationshipFilter
          dataType="Timeseries"
          value={filterState}
          onChange={setFilterState}
        />

        <SegmentedControlWrapper>
          <SegmentedControl
            currentKey={view}
            onButtonClicked={(key) => setView(key as 'Grid' | 'List')}
          >
            <SegmentedControl.Button key="Grid" icon="Grid">
              {t('WIDGET_VIEW_GRID')}
            </SegmentedControl.Button>
            <SegmentedControl.Button key="List" icon="List">
              {t('WIDGET_VIEW_LIST')}
            </SegmentedControl.Button>
          </SegmentedControl>
        </SegmentedControlWrapper>
      </Widget.Header>

      <Widget.Body
        state={transformedData?.length === 0 ? 'empty' : status}
        noPadding
      >
        {renderContent()}
      </Widget.Body>
    </Widget>
  );
};

export const columns = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Description',
    accessorKey: 'description',
  },
  {
    header: 'Preview',
    enableSorting: false,
    cell: ({ row }: any) => {
      const timeseries = row.original;

      return (
        <TimeseriesChart
          timeseries={{ id: timeseries.id }}
          variant="small"
          numberOfPoints={100}
          height={55}
          styles={{ backgroundColor: 'transparent' }}
          dataFetchOptions={{
            mode: 'aggregate',
          }}
          autoRange
        />
      );
    },
  },
  {
    header: 'Unit',
    accessorKey: 'unit',
  },
  {
    header: 'String',
    accessorKey: 'isString',
  },
  {
    header: 'Step',
    accessorKey: 'isStep',
  },
];

const SegmentedControlWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const Container = styled.div`
  border-bottom: 1px solid var(--cogs-border--interactive--default);

  &:last-child {
    border-bottom: none;
  }
`;

const Content = styled.div`
  padding: 16px;
  padding-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
