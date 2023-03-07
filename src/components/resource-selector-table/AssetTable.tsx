import { Dispatch, SetStateAction, useMemo } from 'react';

import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon, Loader } from '@cognite/cogs.js';
import { Asset, InternalId } from '@cognite/sdk';
import { Alert } from 'antd';

import { useTranslation } from 'common';
import { TABLE_ITEMS_PER_PAGE } from 'common/constants';
import { useAssets, useAssetSearch } from 'hooks/assets';

type AssetListTableRecord = { key: string } & Pick<
  Asset,
  'name' | 'rootId' | 'dataSetId' | 'id' | 'description' | 'lastUpdatedTime'
>;
type AssetListTableRecordCT = ColumnType<AssetListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'lastUpdatedTime';
};

type Props = {
  query?: string | null;
  selected: InternalId[];
  setSelected: Dispatch<SetStateAction<InternalId[]>>;
};
export default function AssetTable({ query, selected, setSelected }: Props) {
  const { t } = useTranslation();
  const { data, isInitialLoading, error } = useAssets(
    TABLE_ITEMS_PER_PAGE,
    undefined,
    {
      enabled: !query,
    }
  );

  const { data: searchResult, isInitialLoading: searchLoading } =
    useAssetSearch(query!, {
      enabled: !!query,
      select: (items) => items?.map((i) => ({ ...i, key: i.id.toString() })),
    });

  const listPages = useMemo(
    () =>
      data?.pages[0]?.items?.map((a) => ({ ...a, key: a.id.toString() })) || [],
    [data]
  );

  const dataSource = query ? searchResult : listPages;

  const loading = isInitialLoading || searchLoading;

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
        render: (value: Date) => value.toLocaleString(),
      },
    ],
    [t]
  );

  const rowSelection = {
    selectedRowKeys: selected.map((s) => s.id.toString()),
    type: 'checkbox' as RowSelectionType,
    onChange(_: (string | number)[], rows: AssetListTableRecord[]) {
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

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <Table<AssetListTableRecord>
      loading={loading}
      columns={columns}
      emptyContent={loading ? <Icon type="Loader" /> : undefined}
      appendTooltipTo={undefined}
      rowSelection={rowSelection}
      dataSource={dataSource}
    />
  );
}
