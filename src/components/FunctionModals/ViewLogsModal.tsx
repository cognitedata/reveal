import React, { useState, SyntheticEvent } from 'react';
import { Modal, Input, Alert, Row, Col } from 'antd';
import { Icon } from '@cognite/cogs.js';
import moment from 'moment';
import { Call, Log } from 'types';
import Highlighter from 'react-highlight-words';
import { useQuery, useQueryCache } from 'react-query';
import { getLogs, getCall } from 'utils/api';
import LoadingIcon from 'components/LoadingIcon';
import { fnCallsKey, fnLogsKey } from 'utils/queryKeys';
import NoLogs from './icons/emptyLogs';

type Props = {
  onCancel: () => void;
  id: number;
  callId: number;
};

type BodyProps = {
  logs?: Log[];
  call?: Call;
  error: boolean;
  fetched: boolean;
};
function ModalBody({ logs, call, error, fetched }: BodyProps) {
  const [logsSearch, setLogsSearch] = useState('');

  if (fetched) {
    return (
      <Row>
        <Col span={1}>
          <LoadingIcon />
        </Col>
        <Col span={23}>Fetching logs</Col>
      </Row>
    );
  }
  if (error) {
    return (
      <Alert
        type="error"
        icon={<Icon type="ErrorFilled" />}
        message="Error"
        description="There was an error fetching the logs"
      />
    );
  }

  if (logs?.length === 0) {
    return (
      <>
        <em>No logs were returned from this function call</em>
        <NoLogs />
      </>
    );
  }

  return (
    <>
      <Input
        name="filter"
        prefix={<Icon type="Search" />}
        value={logsSearch}
        onChange={evt => setLogsSearch(evt.target.value)}
        style={{ marginBottom: '16px' }}
      />
      {fetched && <LoadingIcon />}
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
}

export default function ViewLogsModal({ onCancel, id, callId }: Props) {
  const queryCache = useQueryCache();
  const {
    data: logs,
    isFetching: logsFetching,
    isFetched: isLogsFetched,
    isError: logError,
  } = useQuery<{
    items: Log[];
  }>(fnCallsKey({ id, callId }), getLogs);
  const {
    data: call,
    isFetching: callFetching,
    isFetched: isCallFetched,
    isError: callError,
  } = useQuery<Call>(fnLogsKey({ id, callId }), getCall);

  const fetched = !isLogsFetched || !isCallFetched;
  const fetching = logsFetching || callFetching;
  const error = logError || callError;

  const update = (e: SyntheticEvent) => {
    e.preventDefault();
    queryCache.invalidateQueries(fnCallsKey({ id, callId }));
    queryCache.invalidateQueries(fnLogsKey({ id, callId }));
  };

  return (
    <Modal
      visible
      title="Logs"
      width={900}
      closeIcon={fetching ? <LoadingIcon /> : null}
      cancelText="Close"
      okText={error ? 'Retry' : 'Update'}
      onCancel={onCancel}
      onOk={update}
    >
      <ModalBody
        fetched={fetched}
        error={error}
        call={call}
        logs={logs?.items}
      />
    </Modal>
  );
}
