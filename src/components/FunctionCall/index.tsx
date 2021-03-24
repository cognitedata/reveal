import React, { useState, useEffect } from 'react';
import {
  FunctionCall as CogniteFunctionCall,
  useFunctionCall,
  useFunctionReponse,
} from 'utils/cogniteFunctions';

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
  const [refetchInterval, setInterval] = useState<number | false>(1000);

  const { data: call, isFetched } = useFunctionCall(id, callId, {
    refetchInterval,
  });
  const { data: response, refetch: getResponse } = useFunctionReponse(
    id,
    callId,
    {
      // manual refetch overrides enabled: false
      enabled: false,
    }
  );

  const callStatus = call?.status;
  useEffect(() => {
    if (callStatus && callStatus !== 'Running') {
      setInterval(false);
      if (callStatus === 'Completed') {
        getResponse();
      }
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
      response,
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
