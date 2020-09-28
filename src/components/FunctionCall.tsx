import React, { useState, useEffect } from 'react';

import { CallResponse } from 'types';
import { useCall } from 'utils/hooks';

interface Props {
  id: number;
  callId?: number;
  renderCall: (call: CallResponse) => JSX.Element | null;
  renderLoading?: () => JSX.Element | null;
}

interface InnerProps extends Props {
  callId: number;
}

function InnerFunctionCall({
  id,
  callId,
  renderCall,
  renderLoading,
}: InnerProps) {
  const [refetchInterval, setInterval] = useState<number | false>(1000);

  const { data: callResponse, isFetched } = useCall(
    { id, callId },
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

  if (!isFetched) {
    return renderLoading ? renderLoading() : null;
  }
  if (isFetched && callResponse) {
    return renderCall(callResponse);
  }
  return null;
}

export default function FunctionCall({
  id,
  callId,
  renderCall,
  renderLoading,
}: Props) {
  if (!callId) {
    return null;
  }
  return (
    <InnerFunctionCall
      id={id}
      callId={callId}
      renderCall={renderCall}
      renderLoading={renderLoading}
    />
  );
}
