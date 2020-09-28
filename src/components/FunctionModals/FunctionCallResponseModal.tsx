import React, { SyntheticEvent } from 'react';
import { Modal, Alert } from 'antd';
import { Icon, Button } from '@cognite/cogs.js';
import { CallResponse } from 'types/Types';
import { useQueryCache } from 'react-query';
import { responseKey } from 'utils/queryKeys';
import ErrorFeedback from 'components/Common/atoms/ErrorFeedback';
import { useResponse } from 'utils/hooks';

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
  const queryCache = useQueryCache();
  const { data: response, error, isFetched, isFetching } = useResponse({
    id,
    callId,
  });

  const update = (e: SyntheticEvent) => {
    e.preventDefault();
    queryCache.invalidateQueries(responseKey({ id, callId }));
  };

  return (
    <Modal
      visible
      title="Call response"
      footer={[
        <Button
          key="close"
          icon="XLarge"
          onClick={onCancel}
          style={{
            /** Padding needed because of inconsistent icon sizes in cogs * */
            paddingTop: 10,
          }}
        >
          Close
        </Button>,
        <Button
          key="button"
          type="primary"
          icon={isFetching ? 'Loading' : 'Refresh'}
          onClick={update}
        >
          {error ? 'Retry' : 'Update'}
        </Button>,
      ]}
      width={900}
      onCancel={onCancel}
    >
      <ModalBody response={response} error={error} fetched={isFetched} />
    </Modal>
  );
}
