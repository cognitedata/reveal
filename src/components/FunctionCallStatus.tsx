import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useQuery } from 'react-query';
import { CallResponse } from 'types';
import { getCall } from 'utils/api';

type Props = {
  id: number;
  callId?: number;
};

function InnerFunctionCallStatus({ id, callId }: Props) {
  const [refetchInterval, setInterval] = useState<number | false>(1000);

  const { data: callResponse } = useQuery<CallResponse>(
    [`/functions/calls`, { id, callId }],
    getCall,
    {
      refetchInterval,
    }
  );
  const callStatus = callResponse?.status;
  useEffect(() => {
    if (callStatus && callStatus !== 'Running') {
      setInterval(false);
    } else {
      setInterval(1000);
    }
  }, [callResponse, callStatus]);

  switch (callResponse?.status) {
    case 'Running':
      return <Tag color="blue">Running</Tag>;
    case 'Completed':
      return <Tag color="green">Completed</Tag>;
    case 'Failed':
      return <Tag color="red">Failed</Tag>;
    case 'Timeout':
      return <Tag color="red">Timeout</Tag>;
    default:
      return <Icon type="Loading" />;
  }
}

export default function FunctionCallStatus({ id, callId }: Props) {
  if (!callId) {
    return null;
  }
  return <InnerFunctionCallStatus id={id} callId={callId} />;
}
