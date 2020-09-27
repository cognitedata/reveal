import React from 'react';
import { Tag } from 'antd';
import { CallResponse } from 'types';
import FunctionCall from './FunctionCall';
import LoadingIcon from 'components/LoadingIcon';

type Props = {
  id: number;
  callId?: number;
};

function InnerFunctionCallStatus({ response }: { response: CallResponse }) {
  const { status } = response;

  switch (status) {
    case 'Running':
      return <Tag color="blue">Running</Tag>;
    case 'Completed':
      return <Tag color="green">Completed</Tag>;
    case 'Failed':
      return <Tag color="red">Failed</Tag>;
    case 'Timeout':
      return <Tag color="red">Timeout</Tag>;
    default:
      return null;
  }
}

export default function FunctionCallStatus({ id, callId }: Props) {
  return (
    <FunctionCall
      id={id}
      callId={callId}
      renderLoading={() => <LoadingIcon />}
      renderCall={response => <InnerFunctionCallStatus response={response} />}
    />
  );
}
