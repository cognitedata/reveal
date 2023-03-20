import { useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { useList } from 'hooks/list';
import { RawSequence } from 'types/api';
import { SourceTableProps } from 'types/types';

type SequenceListTableRecord = { key: string } & RawSequence;
type SequenceListTableRecordCT = ColumnType<SequenceListTableRecord> & {
  title: string;
};

export default function SequenceTable({
  selected,
  setSelected,
  advancedFilter,
  filter,
  allSources,
}: SourceTableProps) {
  const { data, isInitialLoading, error } = useList('sequences', {
    filter,
    advancedFilter,
    limit: 100,
  });

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

  const columns: SequenceListTableRecordCT[] = useMemo(
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
    onChange(_: (string | number)[], rows: SequenceListTableRecord[]) {
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

  return (
    <Table<SequenceListTableRecord>
      loading={isInitialLoading}
      columns={columns}
      emptyContent={isInitialLoading ? <Icon type="Loader" /> : undefined}
      appendTooltipTo={undefined}
      rowSelection={rowSelection}
      dataSource={dataSource || []}
      pagination={{ defaultPageSize: 25 }}
    />
  );
}
