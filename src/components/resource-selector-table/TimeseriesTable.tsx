import { Dispatch, SetStateAction, useMemo, useEffect } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon, Loader } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { InternalId } from '@cognite/sdk';
import { RawTimeseries, useTimeseriesSearch } from 'hooks/timeseries';
import { Filter } from 'context/QuickMatchContext';
import { useList } from 'hooks/list';

type TimeseriesListTableRecord = { key: string; disabled?: boolean } & Pick<
  RawTimeseries,
  'name' | 'dataSetId' | 'id' | 'description' | 'lastUpdatedTime'
>;
type TimeseriesListTableRecordCT = ColumnType<TimeseriesListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'lastUpdatedTime';
};

type Props = {
  query?: string | null;
  advancedFilter?: any;
  filter: Filter;
  selected: InternalId[];
  setSelected: Dispatch<SetStateAction<InternalId[]>>;
  allSources: boolean;
};
export default function TimeseriesTable({
  query,
  selected,
  setSelected,
  advancedFilter,
  filter,
  allSources,
}: Props) {
  const {
    data: listPages,
    isInitialLoading: listLoading,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useList(
    'timeseries',
    1,
    { limit: 100, advancedFilter, filter },
    { enabled: !query }
  );

  useEffect(() => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      listPages?.pages &&
      listPages.pages.length <= 2
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, listPages, fetchNextPage]);

  const { data: searchResult, isInitialLoading: searchLoading } =
    useTimeseriesSearch(query!, {
      enabled: !!query,
      select: (items) => items?.map((i) => ({ ...i, key: i.id.toString() })),
    });

  const loading = listLoading || searchLoading;
  const { t } = useTranslation();

  const collapsedListPages = useMemo(
    () =>
      listPages?.pages[0]?.items.map((a) => ({
        ...a,
        key: a.id.toString(),
      })) || [],
    [listPages]
  );

  const dataSource = (!!query ? searchResult : collapsedListPages)?.map(
    (ts) => ({ ...ts, disabled: allSources })
  );

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
      setSelected(rows.map((r) => ({ id: r.id })));
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
    />
  );
}
