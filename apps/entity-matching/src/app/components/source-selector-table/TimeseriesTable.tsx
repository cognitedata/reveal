import { useMemo } from 'react';

import { Alert, Checkbox } from 'antd';
import { TableRowSelection } from 'antd/lib/table/interface';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Icon, Loader, Body, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { PAGINATION_SETTINGS } from '../../common/constants';
import { useList } from '../../hooks/list';
import { RawTimeseries } from '../../types/api';
import { SourceTableProps } from '../../types/types';
import QuickMatchDataSet from '../quick-match-data-set/QuickMatchDataSet';

type TimeseriesListTableRecord = {
  key: string;
  disabled?: boolean;
} & RawTimeseries;
type TimeseriesListTableRecordCT = ColumnType<TimeseriesListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'lastUpdatedTime' | 'dataset';
};

export default function TimeseriesTable({
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
        sorter: (a, b) => (a?.name || '').localeCompare(b?.name || ''),
      },
      {
        title: t('resource-table-column-description'),
        dataIndex: 'description',
        key: 'description',
        sorter: (a, b) =>
          (a?.description || '').localeCompare(b?.description || ''),
      },
      {
        title: t('data-set'),
        dataIndex: 'dataSetId',
        key: 'dataset',
        render: (value) =>
          !!value && (
            <Body level={2} strong>
              <QuickMatchDataSet dataSetId={value} />
            </Body>
          ),
        sorter: (
          rowA: TimeseriesListTableRecord,
          rowB: TimeseriesListTableRecord
        ) => (rowA?.dataSetId ?? 0) - (rowB?.dataSetId ?? 0),
      },
      {
        title: t('resource-table-column-lastUpdated'),
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        render: (value: number) => new Date(value).toLocaleString(),
        sorter: (
          rowA: TimeseriesListTableRecord,
          rowB: TimeseriesListTableRecord
        ) => (rowA?.lastUpdatedTime ?? 0) - (rowB?.lastUpdatedTime ?? 0),
      },
    ],
    [t]
  );

  const rowSelection: TableRowSelection<TimeseriesListTableRecord> = {
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
