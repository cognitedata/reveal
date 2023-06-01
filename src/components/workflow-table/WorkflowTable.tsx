import { ColumnType, Table } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';
import { WorkflowRead } from 'hooks/workflows';
import { useMemo } from 'react';
import { getContainer } from 'utils';

type WorkflowTableProps = {
  workflows: WorkflowRead[];
};

type WorkflowTableRecord = {
  key: string;
} & WorkflowRead;

type WorkflowTableColumn = ColumnType<WorkflowTableRecord> & {
  title: string;
};

const WorkflowTable = ({ workflows }: WorkflowTableProps): JSX.Element => {
  const { t } = useTranslation();

  const columns: WorkflowTableColumn[] = useMemo(
    () => [
      {
        key: 'externalId',
        dataIndex: 'externalId',
        title: t('external-id'),
      },
      {
        key: 'description',
        dataIndex: 'description',
        title: t('description'),
      },
      {
        key: 'createdTime',
        dataIndex: 'createdTime',
        title: t('created-at'),
      },
    ],
    [t]
  );

  const dataSource = useMemo(
    () => workflows.map((w) => ({ ...w, key: w.externalId })),
    [workflows]
  );

  return (
    <Table<WorkflowTableRecord>
      appendTooltipTo={getContainer()}
      columns={columns}
      dataSource={dataSource}
      emptyContent={<></>}
    />
  );
};

export default WorkflowTable;
