import React from 'react';
import { Card, Modal, Tooltip } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { CallResponse } from 'types/Types';
import { useQuery } from 'react-query';
import NoLogs from './icons/emptyLogs';
import { getResponse } from 'utils/api';

type Props = {
  onCancel: () => void;
  id: number;
  callId: number;
};

export default function ViewResponseModal({ id, callId, onCancel }: Props) {
  const { data: response, error, isFetched } = useQuery<
    CallResponse
    >(['/function/call/response', { id, callId }], getResponse);

  let displayResponse;
  if (!isFetched) {
    displayResponse = <em>Loading...</em>;
  } else if (response) {
    displayResponse = <pre>{JSON.stringify(response, null, 4)}</pre>;
  } else if (error) {
    displayResponse = <em>There was an error fetching the response</em>;
  } else {
    displayResponse = (
      <>
        <em>No response was returned from this function call</em>
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
    if (!isFetched) {
      icon = <Icon type="Loading" style={{ paddingLeft: '8px' }} />;
    }
    if (error) {
      icon = (
        <Tooltip placement="right" title="There was an error ">
          <Icon type="Close" style={{ paddingLeft: '8px', color: '#ff0000' }} />
        </Tooltip>
      );
    }
    return (
      <div>
        Call Response
        {icon}
      </div>
    );
  };

  return (
    <Modal
      visible={true}
      footer={null}
      width="900px"
      onCancel={onCancel}
      style={{ overflowY: 'scroll', height: '75%' }}
    >
      <Card title={title()} style={{ marginRight: '24px' }}>
        {displayResponse}
      </Card>
    </Modal>
  );
}
