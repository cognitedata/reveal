import { useCallback, useMemo } from 'react';

import {
  ColumnType,
  Table,
  Timestamp,
  createLink,
} from '@cognite/cdf-utilities';

import { useTranslation } from 'common';
import { useDeleteWorkflow } from 'hooks/workflows';
import { getContainer } from 'utils';
import Link from 'components/link/Link';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { WorkflowResponse } from 'types/workflows';
import { BasicPlaceholder } from 'components/basic-placeholder/BasicPlaceholder';

type WorkflowTableProps = {
  workflows: WorkflowResponse[];
};

type WorkflowTableRecord = {
  key: string;
} & WorkflowResponse;

type WorkflowTableColumn = ColumnType<WorkflowTableRecord> & {
  title: string;
};

const WorkflowTable = ({ workflows }: WorkflowTableProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate: deleteWorkflow } = useDeleteWorkflow();

  const handleDelete = useCallback(
    (externalId: string): void => {
      deleteWorkflow({ externalId });
    },
    [deleteWorkflow]
  );

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
      {
        key: 'options',
        dataIndex: 'externalId',
        title: '',
        width: 30,
        render: (value: string) => (
          <Dropdown
            content={
              <Menu>
                <Menu.Item onClick={() => handleDelete(value)}>
                  {t('delete')}
                </Menu.Item>
              </Menu>
            }
          >
            <Button
              aria-label="Open options menu for workflow"
              icon="EllipsisHorizontal"
              size="small"
              type="ghost"
            />
          </Dropdown>
        ),
      },
    ],
    [t, handleDelete]
  );

  const dataSource = useMemo(
    () => workflows.map((w) => ({ ...w, key: w.externalId })),
    [workflows]
  );

  if (workflows.length === 0)
    return (
      <BasicPlaceholder
        type="EmptyStateSearchSad"
        title={t('search-no-workflows')}
      />
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
