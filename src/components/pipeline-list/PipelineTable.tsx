import { Key, useMemo, useState } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

import PipelineName from 'components/pipeline-name/PipelineName';
import { stringSorter } from 'common/utils';
import { useTranslation } from 'common';
import { stringCompare } from 'utils/shared';
import { Pipeline, useEMPipelines } from 'hooks/contextualization-api';

type PipelineListTableRecord = { key: string } & Pick<
  Pipeline,
  'id' | 'name' | 'description' | 'owner'
>;
type PipelineListTableRecordCT = ColumnType<PipelineListTableRecord> & {
  title: string;
  key: 'id' | 'name' | 'description' | 'owner';
};

const PipelineTable = (): JSX.Element => {
  const { data, isInitialLoading } = useEMPipelines();
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const handleToggleCheckbox = (
    _: Key[],
    selectedRows: PipelineListTableRecord[]
  ) => {
    setSelectedRowKeys(selectedRows.map(({ key }) => key));
  };

  const rowSelection = {
    selectedRowKeys,
    type: 'checkbox' as RowSelectionType,
    onChange: handleToggleCheckbox,
  };

  const dataSource = useMemo(
    () => data?.map((a) => ({ ...a, key: a.id.toString() })) || [],
    [data]
  );

  const columns: PipelineListTableRecordCT[] = useMemo(
    () => [
      {
        title: t('pipeline-list-table-column-title-name'),
        dataIndex: 'name',
        key: 'name',
        render: (value, record) => <PipelineName id={record.id} name={value} />,
        sorter: (a, b) => stringSorter(a, b, 'name'),
      },
      {
        title: t('pipeline-list-table-column-title-description'),
        dataIndex: 'description',
        key: 'description',
        render: (description: string) => description || '—',
        sorter: (a: any, b: any) =>
          stringCompare(a?.description, b?.description),
      },
      {
        title: t('pipeline-list-table-column-title-owner'),
        dataIndex: 'owner',
        key: 'owner',
        render: (owner: string) => owner,
        sorter: (a: any, b: any) => stringCompare(a?.owner, b?.owner),
      },
    ],
    [t]
  );

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <Table<PipelineListTableRecord>
      columns={columns}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      dataSource={dataSource}
      rowSelection={rowSelection}
    />
  );
};

export default PipelineTable;
