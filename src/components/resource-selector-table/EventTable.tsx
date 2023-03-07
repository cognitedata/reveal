import { Dispatch, SetStateAction, useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon, Loader } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { InternalId } from '@cognite/sdk';
import { useEventsSearch } from 'hooks/events';
import { Filter } from 'context/QuickMatchContext';
import { useList } from 'hooks/list';
import { RawCogniteEvent } from 'types/api';

type EventListTableRecord = { key: string } & Pick<
  RawCogniteEvent,
  'dataSetId' | 'id' | 'description' | 'lastUpdatedTime' | 'type' | 'subtype'
>;
type EventListTableRecordCT = ColumnType<EventListTableRecord> & {
  title: string;
};

type Props = {
  query?: string | null;
  advancedFilter?: any;
  filter: Filter;
  selected: InternalId[];
  setSelected: Dispatch<SetStateAction<InternalId[]>>;
};
export default function EventTable({
  query,
  selected,
  setSelected,
  advancedFilter,
  filter,
}: Props) {
  const {
    data: listPages,
    isInitialLoading: listLoading,
    error,
  } = useList(
    'events',
    1,
    { filter, advancedFilter, limit: 100 },
    { enabled: !query }
  );

  const { data: searchResult, isInitialLoading: searchLoading } =
    useEventsSearch(query!, {
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
    selectedRowKeys: selected.map((s) => s.id.toString()),
    type: 'checkbox' as RowSelectionType,
    onChange(_: (string | number)[], rows: EventListTableRecord[]) {
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
    <Table<EventListTableRecord>
      loading={loading}
      columns={columns}
      emptyContent={loading ? <Icon type="Loader" /> : undefined}
      appendTooltipTo={undefined}
      rowSelection={rowSelection}
      dataSource={dataSource || []}
    />
  );
}
