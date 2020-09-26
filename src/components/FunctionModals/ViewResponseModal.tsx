import React from 'react';
import { Card, Modal, Tooltip } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { Call, CogFunction, CallResponse } from 'types/Types';
import { useQuery } from 'react-query';
import NoLogs from './icons/emptyLogs';

type Props = {
  onCancel: () => void;
  visible: boolean;
  call: Call;
  currentFunction: CogFunction;
};

export default function ViewResponseModal(props: Props) {
  const { onCancel, visible, call, currentFunction } = props;

  const { data: response, error, isFetching: fetching } = useQuery<
    CallResponse
  >(`/functions/${currentFunction.id}/calls/${call.id}/response`);

  let displayResponse;
  if (fetching) {
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
    if (fetching) {
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
      visible={visible}
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
