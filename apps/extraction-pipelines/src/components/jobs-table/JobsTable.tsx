import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Status } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { Box } from 'components/box/Box';
import { MQTTJobWithMetrics } from 'hooks/hostedExtractors';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { getJobStatusForCogs } from 'utils/hostedExtractors';
import { getContainer } from 'utils/utils';

type JobsTableRecord = { key: string } & MQTTJobWithMetrics;

type JobsTableProps = {
  className?: string;
  jobs?: MQTTJobWithMetrics[];
};

export const JobsTable = ({
  className,
  jobs = [],
}: JobsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const columns: (ColumnType<JobsTableRecord> & { title: string })[] = useMemo(
    () => [
      {
        key: 'topicFilter',
        dataIndex: 'topicFilter',
        title: t('topic-filter_one'),
      },
      {
        key: 'throughput',
        dataIndex: 'throughput',
        title: t('throughput'),
        render: (value) =>
          t('datapoints-per-hour', {
            count: value,
          }),
      },
      {
        key: 'messageCount',
        dataIndex: 'topicFilter',
        title: t('number-of-messages'),
        render: (_, job) =>
          job.metrics.reduce((acc, cur) => acc + cur.sourceMessages, 0),
      },
      {
        key: 'status',
        dataIndex: 'topicFilter',
        title: t('status'),
        render: (_, job) =>
          job.status ? (
            <Status
              text={t(`mqtt-job-status-${job.status}`)}
              type={getJobStatusForCogs(job)}
            />
          ) : (
            '-'
          ),
      },
    ],
    [t]
  );

  const dataSource = useMemo(
    () => jobs.map((job) => ({ ...job, key: job.externalId })),
    [jobs]
  );

  return (
    <Box className={className}>
      <Content>
        <Table<JobsTableRecord>
          columns={columns}
          dataSource={dataSource}
          emptyContent={null}
          appendTooltipTo={getContainer()}
        />
      </Content>
    </Box>
  );
};

const Content = styled.div`
  padding: 8px 16px 0;
`;
