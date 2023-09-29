import { useMemo } from 'react';

import { Alert, Checkbox } from 'antd';
import { TableRowSelection } from 'antd/lib/table/interface';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Icon, Loader, Body, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { PAGINATION_SETTINGS } from '../../common/constants';
import { useList } from '../../hooks/list';
import { RawCogniteEvent } from '../../types/api';
import { SourceTableProps } from '../../types/types';
import QuickMatchDataSet from '../quick-match-data-set/QuickMatchDataSet';

type EventListTableRecord = { key: string } & RawCogniteEvent;
type EventListTableRecordCT = ColumnType<EventListTableRecord> & {
  title: string;
};

export default function EventTable({
  selected,
  advancedFilter,
  filter,
  allSources,
  onSelectAll,
  onSelectRow,
  query,
}: SourceTableProps) {
  const {
    data,
    isInitialLoading: listLoading,
    error,
  } = useList('events', { filter, advancedFilter, limit: 100 });

  const loading = listLoading;
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      data?.map((a) => ({
        ...a,
        key: a.id.toString(),
      })) || [],
    [data]
  );

  const dataSource = items?.map((event) => ({
    ...event,
    disabled: allSources,
  }));

  const columns: EventListTableRecordCT[] = useMemo(
    () => [
      {
        title: t('resource-table-column-description'),
        dataIndex: 'description',
        key: 'description',
        sorter: (a, b) =>
          (a?.description || '').localeCompare(b?.description || ''),
      },
      {
        title: t('resource-table-column-type'),
        dataIndex: 'type',
        key: 'type',
        sorter: (a, b) => (a?.type || '').localeCompare(b?.type || ''),
      },
      {
        title: t('resource-table-column-subtype'),
        dataIndex: 'subtype',
        key: 'subtype',
        sorter: (a, b) => (a?.subtype || '').localeCompare(b?.subtype || ''),
      },
      {
        title: t('data-set'),
        dataIndex: 'dataSetId',
        key: 'dataSet',
        render: (value) =>
          !!value && (
            <Body level={2} strong>
              <QuickMatchDataSet dataSetId={value} />
            </Body>
          ),
        sorter: (rowA: EventListTableRecord, rowB: EventListTableRecord) =>
          (rowA?.dataSetId ?? 0) - (rowB?.dataSetId ?? 0),
      },
      {
        title: t('resource-table-column-lastUpdated'),
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        render: (value: number) => new Date(value).toLocaleString(),
        sorter: (rowA: EventListTableRecord, rowB: EventListTableRecord) =>
          (rowA?.lastUpdatedTime ?? 0) - (rowB?.lastUpdatedTime ?? 0),
      },
    ],
    [t]
  );

  const rowSelection: TableRowSelection<EventListTableRecord> = {
    selectedRowKeys: allSources
      ? dataSource?.map((d) => d.id.toString())
      : selected.map((s) => s.id.toString()),
    onSelectAll,
    renderCell: (value, record) => {
      return (
        <Flex alignItems="center">
          <Checkbox
            disabled={allSources}
            onChange={(e) => onSelectRow(record, e.target.checked)}
            checked={value}
          />
        </Flex>
      );
    },
    getCheckboxProps: () => ({ disabled: !!query }),
  };

  if (error?.status === 403) {
    return (
      <Alert
        type="warning"
        message={t('error-403-title')}
        description={t('error-403-description')}
      />
    );
  }

  if (listLoading) {
    return <Loader />;
  }

  return (
    <Table<EventListTableRecord>
      loading={loading}
      columns={columns}
      emptyContent={loading ? <Icon type="Loader" /> : undefined}
      appendTooltipTo={undefined}
      rowSelection={rowSelection}
      dataSource={dataSource || []}
      pagination={PAGINATION_SETTINGS}
    />
  );
}
