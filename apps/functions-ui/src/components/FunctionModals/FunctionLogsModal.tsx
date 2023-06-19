import React, { useState, SyntheticEvent } from 'react';

import styled from 'styled-components';

import { useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Alert } from 'antd';
import moment from 'moment';

import { Icon, Button } from '@cognite/cogs.js';

import ErrorFeedback from '../../components/Common/atoms/ErrorFeedback';
// import Highlighter from 'react-highlight-words';
import { Call, Log } from '../../types';
import { useCall, useLogs } from '../../utils/hooks';
import { logsKey, callKey } from '../../utils/queryKeys';

import NoLogs from './icons/emptyLogs';

type Props = {
  onCancel: () => void;
  id: number;
  callId: number;
};

type BodyProps = {
  logs?: Log[];
  call?: Call;
  errors?: any[];
  fetched: boolean;
};
function ModalBody({ logs, call, errors, fetched }: BodyProps) {
  const [logsSearch, setLogsSearch] = useState('');

  if (!fetched) {
    return <p>Fetching logs</p>;
  }

  if (errors) {
    return (
      <Alert
        type="error"
        message="Error"
        description={
          <>
            <p>There was an error fetching the logs.</p>
            {errors?.map((e, i) => (
              <ErrorFeedback key={i} error={e} />
            ))}
          </>
        }
      />
    );
  }
  if (logs?.length === 0) {
    return (
      <>
        <p>No logs were returned from this function call</p>
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
        onChange={(evt) => setLogsSearch(evt.target.value)}
        style={{ marginBottom: '16px' }}
      />
      <p>
        <b>
          {moment.utc(call?.startTime).format('YYYY-MM-DD hh:mm')} Function
          started
        </b>
      </p>
      <p key={`${call?.id}-logs`}>
        {logs?.map((log: Log, index) => (
          <React.Fragment key={index}>
            {log.message}
            {/* <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[logsSearch]}
              autoEscape
              textToHighlight={log.message}
            /> */}
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
  const client = useQueryClient();
  const {
    data: logs,
    isFetching: logsFetching,
    isFetched: isLogsFetched,
    error: logError,
  } = useLogs({ id, callId });

  const {
    data: call,
    isFetching: callFetching,
    isFetched: isCallFetched,
    error: callError,
  } = useCall({ id, callId });

  const fetched = isLogsFetched && isCallFetched;
  const fetching = logsFetching || callFetching;
  const errors = [logError, callError].filter(Boolean);
  const error: undefined | any[] = errors.length > 0 ? errors : undefined;

  const update = (e: SyntheticEvent) => {
    e.preventDefault();
    client.invalidateQueries(callKey({ id, callId }));
    client.invalidateQueries(logsKey({ id, scheduleId: callId }));
  };

  return (
    <Modal
      open={true}
      title="Logs"
      width={900}
      onCancel={onCancel}
      footer={[
        <StyledCloseButton
          key="close"
          icon="CloseLarge"
          onClick={onCancel}
          style={{
            /** Padding needed because of inconsistent icon sizes in cogs * */
            paddingTop: 10,
          }}
        >
          Close
        </StyledCloseButton>,
        <Button
          key="button"
          type="primary"
          icon={fetching ? 'Loader' : 'Refresh'}
          disabled={fetching}
          onClick={update}
        >
          {error ? 'Retry' : 'Update'}
        </Button>,
      ]}
    >
      <ModalBody fetched={fetched} errors={error} call={call} logs={logs} />
    </Modal>
  );
}

const StyledCloseButton = styled(Button)`
  margin-right: 10px;
`;
