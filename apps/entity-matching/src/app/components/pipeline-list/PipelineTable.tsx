import { Key, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Button, Dropdown } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  PAGINATION_SETTINGS,
  SOURCE_TABLE_QUERY_KEY,
} from '../../common/constants';
import { Pipeline } from '../../hooks/entity-matching-pipelines';
import { PipelineTableTypes } from '../../types/types';
import LatestRunCell from '../latest-run-cell';
import PipelineActionsMenu from '../pipeline-actions-menu/PipelineActionsMenu';
import PipelineName from '../pipeline-name/PipelineName';

type PipelineListTableRecord = { key: string } & Pipeline;

type PipelineListTableRecordCT = ColumnType<PipelineListTableRecord> & {
  title: string;
  key: PipelineTableTypes;
};

const PipelineTable = ({
  dataTestId,
  pipelineList,
  handleReRunPipeline,
  handleDuplicate,
  handleDeletePipeline,
}: {
  dataTestId?: string;
  pipelineList: Pipeline[];
  handleReRunPipeline: (id: number) => void;
  handleDuplicate: (pipeline: Pipeline) => void;
  handleDeletePipeline: (ids: number) => void;
}): JSX.Element => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [searchParams] = useSearchParams('');
  const { t } = useTranslation();
  const searchParam = searchParams.get(SOURCE_TABLE_QUERY_KEY) || '';

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

  const pipelines = useMemo(() => {
    return pipelineList.map((p) => ({
      ...p,
      key: p.id.toString(),
    }));
  }, [pipelineList]);

  const columns: PipelineListTableRecordCT[] = useMemo(
    () => [
      {
        title: t('pipeline-list-table-column-title-name'),
        dataIndex: 'name',
        key: 'name',
        render: (value, record) => <PipelineName id={record.id} name={value} />,
        sorter: (a, b) => (a?.name || '').localeCompare(b?.name || ''),
      },
      {
        title: t('pipeline-list-table-column-title-description'),
        dataIndex: 'description',

        key: 'description',
        render: (description: string) => description,
        sorter: (a, b) =>
          (a?.description || '').localeCompare(b?.description || ''),
      },
      {
        title: t('last-run'),
        dataIndex: 'latestRun',
        key: 'latestRun',
        render: (_, record) => (
          <LatestRunCell id={record.id} lastRun={record.lastRun} />
        ),
        sorter: (
          rowA: PipelineListTableRecord,
          rowB: PipelineListTableRecord
        ) =>
          (rowA?.lastRun?.createdTime ?? 0) - (rowB?.lastRun?.createdTime ?? 0),
      },
      {
        title: '',
        dataIndex: '',
        key: 'run',
        width: '52px',
        render: (_, record) => {
          return (
            <Dropdown
              content={
                <PipelineActionsMenu
                  pipeline={record}
                  onRerunPipeline={() => handleReRunPipeline(record.id)}
                  onDuplicatePipeline={() => handleDuplicate(record)}
                  onDeletePipeline={() => handleDeletePipeline(record.id)}
                  dataTestId="pipeline-actions"
                />
              }
              key={`dropdown-${record.id}`}
            >
              <Button
                aria-label="Options"
                icon="EllipsisHorizontal"
                type="ghost"
                data-testid="pipeline-actions"
              />
            </Dropdown>
          );
        },
      },
    ],
    [handleDeletePipeline, handleDuplicate, handleReRunPipeline, t]
  );

  const pipelinesList = useMemo(
    () =>
      searchParam
        ? pipelines?.filter((pipeline) =>
            (pipeline.name || pipeline.id.toString()).includes(searchParam)
          )
        : pipelines,
    [pipelines, searchParam]
  );

  return (
    <>
      <Table<PipelineListTableRecord>
        columns={columns}
        defaultSort={['latestRun', 'descend']}
        emptyContent={undefined}
        appendTooltipTo={undefined}
        dataSource={pipelinesList}
        rowSelection={rowSelection}
        pagination={PAGINATION_SETTINGS}
        dataTestId={dataTestId}
      />
    </>
  );
};

export default PipelineTable;
