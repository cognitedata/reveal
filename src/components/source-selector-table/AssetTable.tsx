import { useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Body, Icon } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { useList } from 'hooks/list';
import { RawAsset } from 'types/api';
import { TargetTableProps } from 'types/types';
import { PAGINATION_SETTINGS } from 'common/constants';
import { stringSorter } from 'utils';
import { useDataSets } from 'hooks/datasets';
import QuickMatchDataSet from 'components/quick-match-data-set/QuickMatchDataSet';

type AssetListTableRecord = { key: string } & RawAsset;
type AssetListTableRecordCT = ColumnType<AssetListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'dataSet' | 'lastUpdatedTime';
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
  const { data: datasets = [] } = useDataSets('assets');

  const items = useMemo(
    () =>
      datasets.map((ds) => ({
        ...ds,
        key: ds.id.toString(),
        label: `${ds.name || ds.id.toString()} ${
          Number.isFinite(ds.count) ? `(${ds.count})` : ''
        }`,
        value: ds.id,
      })),
    [datasets]
  );

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
        sorter: (a, b) => stringSorter(a?.name, b?.name),
      },
      {
        title: t('resource-table-column-description'),
        dataIndex: 'description',
        key: 'description',
        render: (description: string) => description || '—',
        sorter: (a: any, b: any) =>
          stringSorter(a?.description, b?.description),
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
        sorter: (a, b) => {
          const dataSetA = items.find(
            ({ id: testId }) => a?.dataSetId === testId
          );
          const identifierA = dataSetA?.name ?? dataSetA?.externalId ?? '';
          const dataSetB = items.find(
            ({ id: testId }) => b?.dataSetId === testId
          );
          const identifierB = dataSetB?.name ?? dataSetB?.externalId ?? '';
          return identifierA.localeCompare(identifierB);
        },
      },
      {
        title: t('resource-table-column-lastUpdated'),
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        render: (value: number) => new Date(value).toLocaleString(),
      },
    ],
    [t, items]
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
      dataSource={dataSource || items}
      pagination={PAGINATION_SETTINGS}
    />
  );
}
