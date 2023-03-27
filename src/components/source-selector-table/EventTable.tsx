import { useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon, Loader } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { useList } from 'hooks/list';
import { RawCogniteEvent } from 'types/api';
import { SourceTableProps } from 'types/types';
import { PAGINATION_SETTINGS } from 'common/constants';

type EventListTableRecord = { key: string } & RawCogniteEvent;
type EventListTableRecordCT = ColumnType<EventListTableRecord> & {
  title: string;
};

export default function EventTable({
  selected,
  setSelected,
  advancedFilter,
  filter,
  allSources,
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
      },
      {
        title: t('resource-table-column-type'),
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: t('resource-table-column-subtype'),
        dataIndex: 'subtype',
        key: 'subtype',
      },
      {
        title: t('resource-table-column-lastUpdated'),
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        render: (value: number) => new Date(value).toLocaleString(),
      },
    ],
    [t]
  );

  const rowSelection = {
    selectedRowKeys: allSources
      ? dataSource?.map((d) => d.id.toString())
      : selected.map((s) => s.id.toString()),

    type: 'checkbox' as RowSelectionType,
    onChange(_: (string | number)[], rows: EventListTableRecord[]) {
      setSelected(rows);
    },
    hideSelectAll: true,
    getCheckboxProps(_: any) {
      return {
        disabled: allSources,
      };
    },
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
