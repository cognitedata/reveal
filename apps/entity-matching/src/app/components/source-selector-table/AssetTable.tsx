import { useMemo } from 'react';

import { Alert, Checkbox } from 'antd';
import { TableRowSelection } from 'antd/lib/table/interface';
import { useTranslation } from '@entity-matching-app/common';
import { PAGINATION_SETTINGS } from '@entity-matching-app/common/constants';

import QuickMatchDataSet from '@entity-matching-app/components/quick-match-data-set/QuickMatchDataSet';
import { useDataSets } from '@entity-matching-app/hooks/datasets';

import { ColumnType, Table } from '@cognite/cdf-utilities';

import { useList } from '@entity-matching-app/hooks/list';

import { Body, Flex, Icon } from '@cognite/cogs.js';

import { RawAsset } from '@entity-matching-app/types/api';
import { TargetTableProps } from '@entity-matching-app/types/types';

type AssetListTableRecord = { key: string } & RawAsset;
type AssetListTableRecordCT = ColumnType<AssetListTableRecord> & {
  title: string;
  key: 'name' | 'id' | 'description' | 'dataSet' | 'lastUpdatedTime';
};

export default function AssetTable({
  selected,
  advancedFilter,
  filter,
  allSources,
  onSelectAll,
  onSelectRow,
  query,
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
        sorter: (a, b) => (a?.name || '').localeCompare(b?.name || ''),
      },
      {
        title: t('resource-table-column-description'),
        dataIndex: 'description',

        key: 'description',
        render: (description: string) => description || '—',
        sorter: (a, b) =>
          (a?.description || '').localeCompare(b?.description || ''),
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
        sorter: (rowA: AssetListTableRecord, rowB: AssetListTableRecord) =>
          (rowA?.lastUpdatedTime ?? 0) - (rowB?.lastUpdatedTime ?? 0),
      },
    ],
    [t, items]
  );

  const rowSelection: TableRowSelection<AssetListTableRecord> = {
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
