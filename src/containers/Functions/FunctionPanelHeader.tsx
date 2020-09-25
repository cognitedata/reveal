import React from 'react';

import { useQuery } from 'react-query';
import { Tag, Icon } from 'antd';
import { Tooltip } from '@cognite/cogs.js';
import { Function, Call, Schedule } from 'types';
import moment from 'moment';
import { callStatusTag } from 'containers/Functions/FunctionCalls';
import DeleteFunctionButton from 'components/DeleteFunctionButton';
import RunFunctionButton from 'components/RunFunctionButton';

type Props = {
  currentFunction: Function;
};

export default function FunctionPanelHeader(props: Props) {
  const { currentFunction } = props;
  const { id } = currentFunction;

  const {
    data: scheduleResponse,
    // error: scheduleError
  } = useQuery<{
    items: Schedule[];
  }>('/functions/schedules');
  const schedules =
    scheduleResponse?.items?.filter(
      s => s.functionExternalId === currentFunction.externalId
    ) || [];

  const { data } = useQuery<{ items: Call[] }>(`/functions/${id}/calls`);
  const calls = data?.items || [];

  const functionStatusTag = (status: string) => {
    let color;
    switch (status) {
      case 'Ready':
        color = 'green';
        break;
      case 'Queued':
        color = 'blue';
        break;
      case 'Deploying':
        color = 'blue';
        break;
      case 'Failed':
        color = 'red';
        break;
      default:
        color = 'pink';
        break;
    }

    return (
      <Tag color={color} style={{ marginLeft: '8px' }}>
        {status}
      </Tag>
    );
  };
  const mostRecentCall = calls && calls.length > 0 ? calls[0] : undefined;

  const lastCallDuration = (call: Call) => {
    return moment.utc(call.endTime).fromNow();
  };

  const lastCallStatus = (call: Call) => {
    return callStatusTag(call.status, {
      marginLeft: '8px',
    });
  };

  return (
    <div style={{ overflow: 'auto', display: 'flex', alignItems: 'center' }}>
      <span
        style={{
          width: '30%',
          float: 'left',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflowX: 'auto',
        }}
      >
        {currentFunction.name}
        {schedules.length > 0 ? (
          <Tooltip
            placement="top"
            content={`Has ${schedules.length} schedules`}
          >
            <Icon
              type="clock-circle"
              theme="twoTone"
              style={{ marginLeft: '8px' }}
            />
          </Tooltip>
        ) : undefined}
      </span>
      <span
        style={{
          width: '20%',
          float: 'left',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflowX: 'auto',
        }}
      >
        {functionStatusTag(currentFunction.status)}
      </span>
      <span style={{ width: '20%', float: 'left' }}>
        {mostRecentCall ? (
          <>Last Call: {lastCallDuration(mostRecentCall)}</>
        ) : (
          <>
            Last Call: <em>No calls yet</em>
          </>
        )}
      </span>
      <span style={{ width: '20%', float: 'left' }}>
        {mostRecentCall ? <>{lastCallStatus(mostRecentCall)}</> : null}
      </span>
      <span style={{ float: 'right', marginTop: '4px', marginRight: '4px' }}>
        <RunFunctionButton id={id} />
        <DeleteFunctionButton id={id} />
      </span>
    </div>
  );
}
