import React, { useState } from 'react';
import { Card, Modal, Input } from 'antd';
import { Icon, Tooltip } from '@cognite/cogs.js';
import moment from 'moment';
import { Call, Log } from 'types';
import Highlighter from 'react-highlight-words';
import NoLogs from './icons/emptyLogs';
import { useQuery } from 'react-query';
import { getLogs, getCall } from 'utils/api';

type Props = {
  onCancel: () => void;
  id: number;
  callId: number;
};
const titleText = 'Logs';
const fetchingIcon = <Icon type="Loading" style={{ paddingLeft: '8px' }} />;
const errorIcon = (
  <Tooltip placement="right" content="There was an error ">
    <Icon type="Close" style={{ paddingLeft: '8px', color: '#ff0000' }} />
  </Tooltip>
);
export default function ViewLogsModal({ onCancel, id, callId }: Props) {
  const [logsSearch, setLogsSearch] = useState('');
  const { data, isFetched: isLogsFetched, error } = useQuery<{ items: Log[] }>(
    ['/function/call/logs', { id, callId }],
    getLogs
  );
  const { data: call, isFetched: isCallFetched } = useQuery<Call>(
    ['/function/calls', { id, callId }],
    getCall
  );
  const logs = data?.items;
  const fetching = !isLogsFetched || !isCallFetched;

  let displayLogs;
  if (fetching) {
    displayLogs = <em>Loading...</em>;
  } else if (logs && logs.length > 0) {
    displayLogs = (
      <>
        <p>
          <b>
            {moment.utc(call?.startTime).format('YYYY-MM-DD hh:mm')} Function
            started
          </b>
        </p>
        <p key={`${call?.id}-logs`}>
          {logs?.map((log: Log, index) => (
            <React.Fragment key={index}>
              <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[logsSearch]}
                autoEscape
                textToHighlight={log.message}
              />
              <br />
            </React.Fragment>
          ))}
        </p>
        {call?.endTime && (
          <p>
            <b>
              {moment.utc(call?.endTime).format('YYYY-MM-DD hh:mm')} Function
              ended
            </b>
          </p>
        )}
      </>
    );
  } else if (error) {
    displayLogs = <em>There was an error fetching the logs</em>;
  } else {
    displayLogs = (
      <>
        <em>No logs were returned from this function call</em>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <NoLogs />
        </div>
      </>
    );
  }

  const title = () => {
    let icon = null;
    if (fetching) {
      icon = fetchingIcon;
    }
    if (error) {
      icon = errorIcon;
    }
    return (
      <div>
        {titleText}
        {icon}
      </div>
    );
  };

  return (
    <Modal visible={true} footer={null} width="900px" onCancel={onCancel}>
      <Card title={title()} style={{ marginRight: '24px' }}>
        <Input
          name="filter"
          prefix={
            <Icon
              type="Search"
              style={{
                height: '16px',
                width: '16px',
              }}
            />
          }
          value={logsSearch}
          onChange={evt => setLogsSearch(evt.target.value)}
          style={{ marginBottom: '16px' }}
        />
        {displayLogs}
      </Card>
    </Modal>
  );
}

export const stuffForUnitTests = { titleText, fetchingIcon, errorIcon };
