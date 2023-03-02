import { Dispatch, SetStateAction, useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon, Loader } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { InternalId, Timeseries } from '@cognite/sdk';
import { useTimeseries, useTimeseriesSearch } from 'hooks/timeseries';
import { Filter } from 'context/QuickMatchContext';

type TimeseriesListTableRecord = { key: string } & Pick<
  Timeseries,
  'name' | 'dataSetId' | 'id' | 'description' | 'lastUpdatedTime'
>;
type TimeseriesListTableRecordCT = ColumnType<TimeseriesListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'lastUpdatedTime';
};

type Props = {
  query?: string | null;
  unmatchedOnly?: boolean;
  filter: Filter;
  selected: InternalId[];
  setSelected: Dispatch<SetStateAction<InternalId[]>>;
};
export default function TimeseriesTable({
  query,
  selected,
  setSelected,
  unmatchedOnly,
  filter,
}: Props) {
  const {
    data: listPages,
    isInitialLoading: listLoading,
    error,
  } = useTimeseries({ unmatchedOnly, filter }, { enabled: !query });

  const { data: searchResult, isInitialLoading: searchLoading } =
    useTimeseriesSearch(query!, {
      enabled: !!query,
      select: (items) => items?.map((i) => ({ ...i, key: i.id.toString() })),
    });

  const loading = listLoading || searchLoading;
  const { t } = useTranslation();

  const collapsedListPages = useMemo(
    () =>
      listPages?.pages[0]?.items?.map((a) => ({
        ...a,
        key: a.id.toString(),
      })) || [],
    [listPages]
  );

  const dataSource = !!query ? searchResult : collapsedListPages;

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
    selectedRowKeys: selected.map((s) => s.id.toString()),
    type: 'checkbox' as RowSelectionType,
    onChange(_: (string | number)[], rows: TimeseriesListTableRecord[]) {
      setSelected(rows.map((r) => ({ id: r.id })));
    },
    hideSelectAll: true,
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
      appendTooltipTo={undefined}
      rowSelection={rowSelection}
      pagination={false}
      dataSource={dataSource || []}
    />
  );
}
