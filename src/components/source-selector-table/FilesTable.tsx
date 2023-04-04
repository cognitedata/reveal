import { useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon, Body } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { useList } from 'hooks/list';
import { RawFileInfo } from 'types/api';
import { SourceTableProps } from 'types/types';
import { useSearch } from 'hooks/search';
import { PAGINATION_SETTINGS } from 'common/constants';
import QuickMatchDataSet from 'components/quick-match-data-set/QuickMatchDataSet';

type FileInfoListTableRecord = { key: string } & RawFileInfo;
type FileInfoListTableRecordCT = ColumnType<FileInfoListTableRecord> & {
  title: string;
};

export default function FileInfoTable({
  selected,
  setSelected,
  advancedFilter,
  filter,
  allSources,
  query,
}: SourceTableProps) {
  const { t } = useTranslation();

  const {
    data: listData,
    isInitialLoading: listLoading,
    error: listError,
  } = useList('files', {
    filter,
    advancedFilter,
    limit: 100,
  });

  const {
    data: searchData,
    isInitialLoading: searchLoading,
    error: searchError,
  } = useSearch(
    'files',
    { name: query },
    {
      filter,
      advancedFilter,
    },
    { enabled: !!query }
  );

  const items = useMemo(
    () =>
      (query ? searchData : listData)?.map((a) => ({
        ...a,
        key: a.id.toString(),
        disabled: allSources,
      })) || [],
    [listData, allSources, query, searchData]
  );

  const isInitialLoading = query ? searchLoading : listLoading;
  const error = query ? searchError : listError;

  const dataSource = items?.map((file) => ({
    ...file,
    disabled: allSources,
  }));

  const columns: FileInfoListTableRecordCT[] = useMemo(
    () => [
      {
        title: t('resource-table-column-name'),
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => (a?.name || '').localeCompare(b?.name || ''),
      },
      {
        title: t('resource-table-column-mimeType'),
        dataIndex: 'mimeType',
        key: 'mimeType',
        sorter: (a, b) => (a?.mimeType || '').localeCompare(b?.mimeType || ''),
      },
      {
        title: t('resource-table-column-directory'),
        dataIndex: 'directory',
        key: 'directory',
        sorter: (a, b) =>
          (a?.directory || '').localeCompare(b?.directory || ''),
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
        sorter: (
          rowA: FileInfoListTableRecord,
          rowB: FileInfoListTableRecord
        ) => (rowA?.dataSetId ?? 0) - (rowB?.dataSetId ?? 0),
      },
      {
        title: t('resource-table-column-lastUpdated'),
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        render: (value: number) => new Date(value).toLocaleString(),
        sorter: (
          rowA: FileInfoListTableRecord,
          rowB: FileInfoListTableRecord
        ) => (rowA?.lastUpdatedTime ?? 0) - (rowB?.lastUpdatedTime ?? 0),
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
    onChange(_: (string | number)[], rows: FileInfoListTableRecord[]) {
      setSelected(rows);
    },
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
    <Table<FileInfoListTableRecord>
      loading={isInitialLoading}
      columns={columns}
      emptyContent={isInitialLoading ? <Icon type="Loader" /> : undefined}
      appendTooltipTo={undefined}
      rowSelection={rowSelection}
      dataSource={dataSource || []}
      pagination={PAGINATION_SETTINGS}
    />
  );
}
