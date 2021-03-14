import { useSDK } from '@cognite/sdk-provider';
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { FunctionCall as CogniteFunctionCall } from 'utils/cogniteFunctions';

type Call = CogniteFunctionCall & {
  response?: string;
};

interface Props {
  id: number;
  callId?: number;
  renderCall: (call: Call) => JSX.Element | null;
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
  const sdk = useSDK();
  const [refetchInterval, setInterval] = useState<number | false>(1000);

  const { data: call, isFetched } = useQuery<CogniteFunctionCall>(
    ['functions', id, 'call', callId],
    () =>
      sdk
        .get(
          `/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}`
        )
        .then((r) => r.data),
    {
      refetchInterval,
    }
  );
  const { data: response } = useQuery<{ response?: string }>(
    ['functions', id, 'call', callId, 'response'],
    () =>
      sdk
        .get(
          `/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}/response`
        )
        .then((r) => r.data),
    {
      enabled: call?.status === 'Completed',
    }
  );

  const callStatus = call?.status;
  useEffect(() => {
    if (callStatus && callStatus !== 'Running') {
      setInterval(false);
    } else {
      setInterval(1000);
    }
  }, [call, callStatus]);

  if (!isFetched) {
    return renderLoading ? renderLoading() : null;
  }
  if (isFetched && call) {
    return renderCall({
      ...call,
      response: response?.response,
    });
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
