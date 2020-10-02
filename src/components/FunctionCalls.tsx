import React from 'react';
import moment from 'moment';
import { Alert, Table } from 'antd';
import { Call } from 'types';

import ViewLogsButton from 'components/buttons/ViewLogsButton';
import ViewResponseButton from 'components/buttons/ViewResponseButton';
import LoadingIcon from 'components/LoadingIcon';
import FunctionCallStatus from 'components/FunctionCallStatus';
import FunctionCall from 'components/FunctionCall';
import { useCalls } from 'utils/hooks';

const callTableColumns = [
  {
    title: 'Call Time',
    key: 'Call Time',
    render: (call: Call) => {
      const startTime = moment.utc(call.startTime);
      const timeSince = moment(startTime).fromNow();
      return timeSince;
    },
  },
  {
    title: 'Duration',
    key: 'duration',
    render: (call: Call) => {
      // If the function isn't finished yet, show current duration with end time being now
      const endTime = moment.utc(call.endTime) || moment.utc(new Date());
      const startTime = moment.utc(call.startTime);

      // round up to the nearest second
      const duration = moment
        .utc(endTime.diff(startTime))
        .add(1, 'second')
        .startOf('second');
      return `${duration.format('mm:ss')} m`;
    },
  },
  {
    title: 'Call Status',
    key: 'callStatus',
    render: (call: Call) => {
      return <FunctionCallStatus id={call.functionId} callId={call.id} />;
    },
  },
  {
    title: 'Response',
    key: 'response',
    render: (call: Call) => {
      return (
        <FunctionCall
          id={call.functionId}
          callId={call.id}
          renderCall={({ functionId, id, status }) => {
            if (status !== 'Running') {
              return <ViewResponseButton id={functionId} callId={id} />;
            }
            return null;
          }}
        />
      );
    },
  },
  {
    title: 'Logs',
    key: 'logs',
    render: (call: Call) => (
      <ViewLogsButton id={call.functionId} callId={call.id} />
    ),
  },
];

type Props = {
  id: number;
  name: string;
  scheduleId?: number;
};

export default function FunctionCalls({ id, name, scheduleId }: Props) {
  const { data, isFetched, error } = useCalls({ id, scheduleId });
  const functionCalls = data || [];

  if (error) {
    return (
      <Alert
        type="error"
        message={`Something went wrong when getting the function calls for ${name} (${id})`}
      />
    );
  }
  if (!isFetched) {
    return <LoadingIcon />;
  }

  return (
    <Table
      rowKey={call => call.id.toString()}
      pagination={{ pageSize: 25 }}
      dataSource={functionCalls}
      columns={callTableColumns}
    />
  );
}
