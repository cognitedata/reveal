import { useEffect, useState } from 'react';
import { CogniteClientPlayground, FunctionCall } from '@cognite/sdk-playground';
import { getFunctionCallResponse, getFunctionCallStatus } from 'api';

const RETRY_DELAY_STEP = 100;
const RETRY_MIN_DELAY = 2000;
const RETRY_MAX_DELAY = 5000;
const MAX_RETRIES = 45; // that is 3 min

const defaultState: {
  fileId?: string;
  loading: boolean;
  error?: any;
} = {
  fileId: undefined,
  loading: false,
  error: undefined,
};

export const usePoolExportFileId = (
  cognitePlaygroundClient?: CogniteClientPlayground,
  functionCall?: FunctionCall
) => {
  const [retryTimeout, setRetryTimeout] = useState<any>();
  const [state, setState] = useState(defaultState);

  const run = (calls = 0) => {
    getFunctionCallStatus(cognitePlaygroundClient!, functionCall!).then(
      (status) => {
        switch (status) {
          case 'Completed':
            getFunctionCallResponse(cognitePlaygroundClient!, functionCall!)
              .then((data) => {
                setState({ ...defaultState, fileId: data.response.toString() });
              })
              .catch((error) => {
                setState({
                  ...defaultState,
                  error,
                });
              });
            return;
          case 'Failed':
          case 'Timeout':
            setState({
              ...defaultState,
              error: new Error(
                `Export-function ${status ? 'failed' : 'timed out'}`
              ),
            });
            return;
          default: {
            if (calls < MAX_RETRIES) {
              const timeout = setTimeout(
                () => run(calls + 1),
                Math.min(
                  RETRY_MIN_DELAY + calls * RETRY_DELAY_STEP,
                  RETRY_MAX_DELAY
                )
              );
              setRetryTimeout(timeout);
            } else {
              setState({
                ...defaultState,
                error: new Error('Export-function reached max number of calls'),
              });
            }
          }
        }
      }
    );
  };

  const startPooling = () => {
    setState({ ...defaultState, loading: true });
    run();
  };

  const stopPooling = () => {
    if (retryTimeout) clearTimeout(retryTimeout);
  };

  const reset = () => {
    stopPooling();
    setState(defaultState);
  };

  useEffect(() => stopPooling, []);

  useEffect(() => {
    reset();
    if (functionCall) {
      startPooling();
    }
  }, [functionCall]);

  return state;
};
