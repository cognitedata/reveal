import { Key, useMemo, useState } from 'react';
import {
  ColumnType,
  notification,
  RowSelectionType,
  Table,
} from '@cognite/cdf-utilities';
import { Button, Dropdown, Loader } from '@cognite/cogs.js';
import PipelineName from 'components/pipeline-name/PipelineName';
import { stringSorter } from 'common/utils';
import { useTranslation } from 'common';
import {
  Pipeline,
  useDeleteEMPipeline,
  useDuplicateEMPipeline,
  useEMPipelines,
} from 'hooks/contextualization-api';
import { PipelineTableTypes } from 'types/types';
import PipelineActionsMenu from 'components/pipeline-actions-menu/PipelineActionsMenu';

type PipelineListTableRecord = { key: string } & Pick<
  Pipeline,
  PipelineTableTypes
>;
type PipelineListTableRecordCT = ColumnType<PipelineListTableRecord> & {
  title: string;
  key: PipelineTableTypes;
};

const PipelineTable = (): JSX.Element => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const { data, isInitialLoading } = useEMPipelines();
  const { mutate: deletePipeline } = useDeleteEMPipeline();
  const { mutate: duplicatePipeline } = useDuplicateEMPipeline();
  const { t } = useTranslation();

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

  const handleDuplicate = (pipeline: Pipeline) => {
    duplicatePipeline(
      {
        id: pipeline.id,
        name: pipeline.name,
        description: pipeline.description,
        sources: pipeline.sources,
        targets: pipeline.targets,
      },
      {
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
  };

  const handleDeletePipeline = (id: number) => {
    deletePipeline(
      { id },
      {
        onSuccess: () => {
          notification.success({
            message: t('notification-success'),
            description: t('pipeline-notification-duplicate-success', {
              name: id,
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
  };

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
          stringSorter(a?.description, b?.description, 'description'),
      },
      {
        title: t('pipeline-list-table-column-title-owner'),
        dataIndex: 'owner',
        key: 'owner',
        sorter: (a: any, b: any) => stringSorter(a?.owner, b?.owner, 'owner'),
      },
      {
        title: '',
        dataIndex: '',
        key: 'run',
        render: (record) => {
          return (
            <Dropdown
              content={
                <PipelineActionsMenu
                  onDuplicatePipeline={() => handleDuplicate(record)}
                  id={record.id}
                  onDeletePipeline={() => handleDeletePipeline(record.id)}
                />
              }
              key={`dropdown-${record.id}`}
            >
              <Button
                aria-label="Options"
                icon="EllipsisHorizontal"
                size="small"
                type="ghost"
              />
            </Dropdown>
          );
        },
      },
    ],
    [dataSource, t]
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
