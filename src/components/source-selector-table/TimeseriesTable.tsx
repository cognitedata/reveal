import { useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon, Loader } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';

import { useList } from 'hooks/list';
import { SourceTableProps } from 'types/types';
import { RawTimeseries } from 'types/api';
import { PAGINATION_SETTINGS } from 'common/constants';

type TimeseriesListTableRecord = {
  key: string;
  disabled?: boolean;
} & RawTimeseries;
type TimeseriesListTableRecordCT = ColumnType<TimeseriesListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'lastUpdatedTime';
};

export default function TimeseriesTable({
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
  } = useList('timeseries', { limit: 1000, advancedFilter, filter });

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

  const dataSource = items?.map((ts) => ({
    ...ts,
    disabled: allSources,
  }));

  const columns: TimeseriesListTableRecordCT[] = useMemo(
    () => [
      {
        title: t('resource-table-column-name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: t('resource-table-column-description'),
        dataIndex: 'description',
        key: 'description',
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
    hideSelectAll: true,
    onChange(_: (string | number)[], rows: TimeseriesListTableRecord[]) {
      setSelected(rows);
    },
    getCheckboxProps(_: TimeseriesListTableRecord) {
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
    <Table<TimeseriesListTableRecord>
      loading={loading}
      columns={columns}
      emptyContent={loading ? <Icon type="Loader" /> : undefined}
      rowSelection={rowSelection}
      dataSource={dataSource || []}
      appendTooltipTo={undefined}
      pagination={PAGINATION_SETTINGS}
    />
  );
}
