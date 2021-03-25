import React, { useState, useEffect } from 'react';
import {
  FunctionCall as CogniteFunctionCall,
  useFunctionCall,
  useFunctionReponse,
} from 'utils/cogniteFunctions';

type Call = CogniteFunctionCall & {
  response?: string | null;
};

interface Props {
  id: number;
  callId?: number;
  renderCall?: (call: Call) => JSX.Element | null;
  renderLoading?: () => JSX.Element | null;
}

interface InnerProps extends Props {
  callId: number;
}

function InnerFunctionCall({
  id,
  callId,
  renderCall = () => null,
  renderLoading,
}: InnerProps) {
  const [refetchInterval, setInterval] = useState<number | false>(1000);

  const { data: call, isError: callError } = useFunctionCall(id, callId, {
    refetchInterval,
  });
  const {
    data: response,
    isError: responseError,
    refetch: refetchResponse,
  } = useFunctionReponse(id, callId, {
    // Some other compoment could have called this hook prematurly, setting it in a completed state
    // in the query cache with null as the response body. It is therefore refetch below then the
    // status is Completed.
    enabled: call?.status === 'Completed',
  });

  const apiError = callError || responseError;
  const callStatus = call?.status;
  useEffect(() => {
    if (response === null && call?.status === 'Completed') {
      refetchResponse();
    }
  }, [call?.status, response, refetchResponse]);

  useEffect(() => {
    if ((callStatus && callStatus !== 'Running') || apiError) {
      setInterval(false);
    } else {
      setInterval(1000);
    }
  }, [call, callStatus, apiError]);

  if (apiError) {
    return renderCall({ id: callId, functionId: id, status: 'Failed' });
  }

  if (!call) {
    return renderLoading ? renderLoading() : null;
  }

  return renderCall({
    ...call,
    response,
  });
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
