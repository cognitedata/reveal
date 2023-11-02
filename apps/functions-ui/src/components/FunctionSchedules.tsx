import React from 'react';

import CreateScheduleButton from '@functions-ui/components/buttons/CreateScheduleButton';
import DeleteScheduleButton from '@functions-ui/components/buttons/DeleteScheduleButton';
import ViewInputDataButton from '@functions-ui/components/buttons/ViewInputDataButton';
import LoadingIcon from '@functions-ui/components/LoadingIcon';
import { Schedule } from '@functions-ui/types';
import { useSchedules } from '@functions-ui/utils/hooks';
import { Table, Alert, List } from 'antd';
import cronstrue from 'cronstrue';
import moment from 'moment';

import FunctionCalls from './FunctionCalls';

const scheduleTableColumns = [
  {
    title: 'Schedule Info',
    key: 'scheduleInfo',
    width: '30%',
    render: (s: Schedule) => {
      return (
        <List.Item style={{ verticalAlign: 'middle' }}>
          <List.Item.Meta title={s.name} description={s.description} />
        </List.Item>
      );
    },
  },
  {
    title: 'Cron Expression',
    key: 'cronExpression',
    render: (s: Schedule) => {
      return s.cronExpression;
    },
  },
  {
    title: (
      <span>
        Occurs{' '}
        <a
          href="https://docs.cognite.com/cdf/functions/#schedule-a-function"
          target="_blank"
          rel="noreferrer"
        >
          (UTC)
        </a>
      </span>
    ),
    key: 'cronExpressionDescription',
    render: (s: Schedule) => {
      return cronstrue.toString(s.cronExpression);
    },
  },
  {
    title: 'Created Time',
    key: 'createdTime',
    render: (s: Schedule) => {
      return moment(s.createdTime).format('MM-DD-YYYY HH:mm');
    },
  },
  {
    title: 'Input Data',
    key: 'inputData',
    render: (s: Schedule) => {
      return <ViewInputDataButton id={s.id} />;
    },
  },
  {
    title: 'Delete',
    key: 'deleteSchedule',
    render: (s: Schedule) => {
      return <DeleteScheduleButton id={s.id} />;
    },
  },
];

type Props = {
  externalId?: string;
  id: number;
};

export default function FunctionSchedules({ externalId, id }: Props) {
  const { data, isFetched, error } = useSchedules();
  const schedules =
    data
      ?.filter((s) => {
        return (
          (s.functionExternalId && s.functionExternalId === externalId) ||
          (s.functionId && s.functionId === id)
        );
      })
      ?.sort((a: Schedule, b: Schedule) => {
        if (a.createdTime > b.createdTime) {
          return -1;
        }
        if (a.createdTime < b.createdTime) {
          return 1;
        }
        return 0;
      }) || [];

  if (error) {
    return (
      <Alert
        type="error"
        message={`Something went wrong when getting the schedule details for ${externalId}`}
      />
    );
  }
  if (!isFetched) {
    return <LoadingIcon />;
  }

  return (
    <>
      <CreateScheduleButton externalId={externalId} id={id} />
      <Table
        rowKey={(s) => s.id.toString()}
        pagination={{ pageSize: 25, showSizeChanger: false }}
        dataSource={schedules}
        columns={scheduleTableColumns}
        expandedRowRender={(s: Schedule) => {
          return <FunctionCalls name={s.name} id={id} scheduleId={s.id} />;
        }}
      />
    </>
  );
}
