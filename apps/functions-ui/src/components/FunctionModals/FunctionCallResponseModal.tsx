import React from 'react';

import { Modal, Alert } from 'antd';

import { Icon, Button } from '@cognite/cogs.js';

import ErrorFeedback from '../../components/Common/atoms/ErrorFeedback';
import { CallResponse } from '../../types/Types';
import { useResponse } from '../../utils/hooks';

type Props = {
  onCancel: () => void;
  id: number;
  callId: number;
};

type BodyProps = {
  response?: CallResponse;
  error?: any;
  fetched: boolean;
};
function ModalBody({ response, error, fetched }: BodyProps) {
  if (!fetched) {
    return <em>Fetching logs</em>;
  }
  if (error) {
    return (
      <Alert
        type="error"
        icon={<Icon type="ErrorFilled" />}
        message="Error"
        description={
          <>
            <p>There was an error fetching the function response.</p>
            <ErrorFeedback error={error} />
          </>
        }
      />
    );
  }

  if (!response) {
    return <em>No response found for this function</em>;
  }

  return <pre>{JSON.stringify(response, null, 4)}</pre>;
}

export default function ViewResponseModal({ id, callId, onCancel }: Props) {
  const {
    data: response,
    error,
    isFetched,
  } = useResponse({
    id,
    callId,
  });

  return (
    <Modal
      open={true}
      title="Call response"
      footer={[
        <Button
          key="close"
          icon="CloseLarge"
          onClick={onCancel}
          style={{
            /** Padding needed because of inconsistent icon sizes in cogs * */
            paddingTop: 10,
          }}
        >
          Close
        </Button>,
      ]}
      width={900}
      onCancel={onCancel}
    >
      <ModalBody response={response} error={error} fetched={isFetched} />
    </Modal>
  );
}
