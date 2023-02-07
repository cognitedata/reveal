import React from 'react';
import moment from 'moment';
import cronstrue from 'cronstrue';
import { Table, Alert, List } from 'antd';

import { Schedule } from 'types';

import DeleteScheduleButton from 'components/buttons/DeleteScheduleButton';
import CreateScheduleButton from 'components/buttons/CreateScheduleButton';
import ViewInputDataButton from 'components/buttons/ViewInputDataButton';
import LoadingIcon from 'components/LoadingIcon';
import { useSchedules } from 'utils/hooks';
import { isOIDCFlow } from 'utils/api';
import FunctionCalls from './FunctionCalls';

const scheduleTableColumns = [
  {
    title: 'Schedule Info',
    key: 'scheduleInfo',
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
    title: 'Occurs',
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
      ?.filter(s => {
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
      {isOIDCFlow() || externalId ? (
        <CreateScheduleButton externalId={externalId} id={id} />
      ) : null}
      <Table
        rowKey={s => s.id.toString()}
        pagination={{ pageSize: 25 }}
        dataSource={schedules}
        columns={scheduleTableColumns}
        expandedRowRender={(s: Schedule) => {
          return <FunctionCalls name={s.name} id={id} scheduleId={s.id} />;
        }}
      />
    </>
  );
}
