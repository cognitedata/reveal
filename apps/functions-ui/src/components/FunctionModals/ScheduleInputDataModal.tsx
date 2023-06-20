import React from 'react';

import { Modal, Alert } from 'antd';

import { Icon, Button } from '@cognite/cogs.js';

import { useRetriveScheduleInputData } from '../../../src/utils/hooks';
import ErrorFeedback from '../../components/Common/atoms/ErrorFeedback';

type Props = {
  onCancel: () => void;
  id: number;
};

type BodyProps = {
  response?: Record<string, any>;
  error?: any;
  fetched: boolean;
};
function ModalBody({ response, error, fetched }: BodyProps) {
  if (!fetched) {
    return <em>Fetching input data</em>;
  }
  if (error) {
    return (
      <Alert
        type="error"
        icon={<Icon type="ErrorFilled" />}
        message="Error"
        description={
          <>
            <p>There was an error fetching the input data response.</p>
            <ErrorFeedback error={error} />
          </>
        }
      />
    );
  }

  if (!response) {
    return <em>No input data found for this function</em>;
  }

  return <pre>{JSON.stringify(response, null, 4)}</pre>;
}

export default function ScheduleInputDataModal({ id, onCancel }: Props) {
  const { data, isFetched, error } = useRetriveScheduleInputData(id);

  return (
    <Modal
      open={true}
      title="Input data"
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
      <ModalBody response={data} error={error} fetched={isFetched} />
    </Modal>
  );
}
