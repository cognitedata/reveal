import React from 'react';
import { useResponse } from 'utils/hooks';
import FunctionCall from './FunctionCall';

const loading = <> No results available yet</>;

type Props = {
  id: number;
  callId?: number;
};

type ResponseProps = {
  id: number;
  callId: number;
};
function SucessReponse({ id, callId }: ResponseProps) {
  const { data, isFetched } = useResponse({ id, callId });
  const response = data?.response;

  if (!isFetched) {
    return loading;
  }

  if (response) {
    return <pre>{JSON.stringify(response, null, 4)}</pre>;
  }
  return <em>No response was returned from this function call</em>;
}

export default function FunctionCallReponse({ id, callId }: Props) {
  if (!callId) {
    return null;
  }
  return (
    <FunctionCall
      id={id}
      callId={callId}
      renderLoading={() => loading}
      renderCall={response => {
        switch (response?.status) {
          case 'Running': {
            return loading;
          }
          case 'Completed': {
            return <SucessReponse id={id} callId={callId} />;
          }
          case 'Failed': {
            // Is it possiblet to the the error/stacktrace from the api?
            return loading;
          }
          case 'Timeout': {
            return <>Timeout</>;
          }
          default: {
            return loading;
          }
        }
      }}
    />
  );
}
