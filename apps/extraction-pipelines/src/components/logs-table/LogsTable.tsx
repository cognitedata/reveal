import React, { useMemo } from 'react';

import styled from 'styled-components';

import { ColumnType, Table, Timestamp } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  ReadMQTTJob,
  ReadMQTTJobLog,
  useMQTTJobLogs,
} from '../../hooks/hostedExtractors';
import { PAGINATION_SETTINGS } from '../../utils/constants';
import { getContainer } from '../../utils/utils';

type LogsTableRecord = { key: number } & ReadMQTTJobLog;

type LogsTableProps = {
  job: ReadMQTTJob;
};

export const LogsTable = ({ job }: LogsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: logs = [] } = useMQTTJobLogs(job.sourceId);

  const columns: (ColumnType<LogsTableRecord> & { title: string })[] = useMemo(
    () => [
      {
        key: 'type',
        dataIndex: 'type',
        title: t('type'),
        render: (value: ReadMQTTJobLog['type']) => t(`mqtt-log-type-${value}`),
        width: '15%',
      },
      {
        key: 'message',
        dataIndex: 'message',
        title: t('message'),
        width: '50%',
      },
      {
        key: 'createdTime',
        dataIndex: 'createdTime',
        title: t('created-at'),
        render: (value: number) => <Timestamp timestamp={value} />,
        width: '25%',
      },
    ],
    [t]
  );

  const dataSource = useMemo(
    () =>
      logs
        .filter(({ jobExternalId }) => jobExternalId === job.externalId)
        .map((log) => ({ ...log, key: log.createdTime })),
    [logs, job.externalId]
  );

  return (
    <Container>
      <Table<LogsTableRecord>
        columns={columns}
        dataSource={dataSource}
        emptyContent={null}
        appendTooltipTo={getContainer()}
        pagination={PAGINATION_SETTINGS}
      />
    </Container>
  );
};

const Container = styled.div`
  background-color: ${Colors['surface--medium']};
  padding: 0 8px 8px 36px;

  .ant-table,
  .ant-table-cell {
    background: inherit;
  }

  .ant-pagination {
    margin-bottom: 0;
  }
`;
