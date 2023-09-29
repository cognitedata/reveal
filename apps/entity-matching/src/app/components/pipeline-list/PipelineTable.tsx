import { Key, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ColumnType,
  notification,
  RowSelectionType,
  Table,
} from '@cognite/cdf-utilities';
import { Button, Dropdown, Loader } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  PAGINATION_SETTINGS,
  SOURCE_TABLE_QUERY_KEY,
} from '../../common/constants';
import {
  Pipeline,
  PipelineWithLatestRun,
  useDeleteEMPipeline,
  useDuplicateEMPipeline,
  useEMPipelinesWithLatestRuns,
} from '../../hooks/entity-matching-pipelines';
import { PipelineTableTypes } from '../../types/types';
import LatestRunCell from '../latest-run-cell';
import PipelineActionsMenu from '../pipeline-actions-menu/PipelineActionsMenu';
import PipelineName from '../pipeline-name/PipelineName';

type PipelineListTableRecord = { key: string } & PipelineWithLatestRun;

type PipelineListTableRecordCT = ColumnType<PipelineListTableRecord> & {
  title: string;
  key: PipelineTableTypes;
};

const PipelineTable = (): JSX.Element => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [searchParams] = useSearchParams('');
  const { data, isInitialLoading } = useEMPipelinesWithLatestRuns();
  const { mutate: deletePipeline } = useDeleteEMPipeline();
  const { mutate: duplicatePipeline } = useDuplicateEMPipeline();
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

  const dataSource = useMemo(
    () => data?.map((a) => ({ ...a, key: a.id.toString() })) || [],
    [data]
  );

  const handleDuplicate = useCallback(
    (pipeline: Pipeline) => {
      duplicatePipeline(
        {
          id: pipeline.id,
          name: pipeline.name,
          description: pipeline.description,
          sources: pipeline.sources,
          targets: pipeline.targets,
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          onSuccess: (_: unknown, pipeline) => {
            notification.success({
              message: t('notification-success'),
              description: t('pipeline-notification-duplicate-success', {
                name: pipeline?.name,
              }),
            });
          },
          onError: () => {
            notification.error({
              message: t('error'),
              description: t('pipeline-notification-duplicate-error'),
            });
          },
        }
      );
    },
    [duplicatePipeline, t]
  );

  const handleDeletePipeline = useCallback(
    (id: number) => {
      deletePipeline(
        { id },
        {
          onSuccess: () => {
            notification.success({
              message: t('notification-success'),
              description: t('pipeline-notification-delete-success', {
                name: id,
              }),
            });
          },
          onError: () => {
            notification.error({
              message: t('error'),
              description: t('pipeline-notification-delete-error'),
            });
          },
        }
      );
    },
    [deletePipeline, t]
  );

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
        render: (value: PipelineWithLatestRun['latestRun']) => (
          <LatestRunCell latestRun={value} />
        ),
        sorter: (
          rowA: PipelineListTableRecord,
          rowB: PipelineListTableRecord
        ) =>
          (rowA?.latestRun?.createdTime ?? 0) -
          (rowB?.latestRun?.createdTime ?? 0),
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
                  onDuplicatePipeline={() => handleDuplicate(record)}
                  pipeline={record}
                  onDeletePipeline={() => handleDeletePipeline(record.id)}
                  latestRun={record.latestRun}
                />
              }
              key={`dropdown-${record.id}`}
            >
              <Button
                aria-label="Options"
                icon="EllipsisHorizontal"
                type="ghost"
              />
            </Dropdown>
          );
        },
      },
    ],
    [handleDeletePipeline, handleDuplicate, t]
  );

  const pipelinesList = useMemo(
    () =>
      searchParam
        ? dataSource?.filter((pipeline) =>
            (pipeline.name || pipeline.id.toString()).includes(searchParam)
          )
        : dataSource,
    [dataSource, searchParam]
  );

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <>
      <Table<PipelineListTableRecord>
        columns={columns}
        emptyContent={undefined}
        appendTooltipTo={undefined}
        dataSource={pipelinesList}
        rowSelection={rowSelection}
        pagination={PAGINATION_SETTINGS}
      />
    </>
  );
};

export default PipelineTable;
