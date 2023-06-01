import { useMemo } from 'react';

import {
  ColumnType,
  Table,
  Timestamp,
  createLink,
} from '@cognite/cdf-utilities';

import { useTranslation } from 'common';
import { WorkflowRead } from 'hooks/workflows';
import { getContainer } from 'utils';
import Link from 'components/link/Link';

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
        render: (value: string) => (
          <Link to={createLink(`/flows/${value}`)}>{value}</Link>
        ),
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
        render: (value: string) => (
          <Timestamp timestamp={new Date(value).getTime()} />
        ),
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
