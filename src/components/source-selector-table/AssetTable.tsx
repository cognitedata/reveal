import { useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { useList } from 'hooks/list';
import { RawAsset } from 'types/api';
import { TargetTableProps } from 'types/types';

type AssetListTableRecord = { key: string } & RawAsset;
type AssetListTableRecordCT = ColumnType<AssetListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'lastUpdatedTime';
};

export default function AssetTable({
  selected,
  setSelected,
  advancedFilter,
  filter,
  allSources,
}: TargetTableProps) {
  const { t } = useTranslation();
  const { data, isInitialLoading, error } = useList('assets', {
    filter,
    advancedFilter,
  });

  const dataSource = useMemo(
    () =>
      data?.map((a) => ({
        ...a,
        key: a.id.toString(),
        disabled: allSources,
      })) || [],
    [data, allSources]
  );

  const columns: AssetListTableRecordCT[] = useMemo(
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
    onChange(_: (string | number)[], rows: AssetListTableRecord[]) {
      setSelected(rows);
    },
    hideSelectAll: true,
    getCheckboxProps(_: AssetListTableRecord) {
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

  return (
    <Table<AssetListTableRecord>
      loading={isInitialLoading}
      columns={columns}
      emptyContent={isInitialLoading ? <Icon type="Loader" /> : undefined}
      appendTooltipTo={undefined}
      rowSelection={rowSelection}
      dataSource={dataSource}
      pagination={{ defaultPageSize: 25 }}
    />
  );
}
