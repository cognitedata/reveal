import { useRef } from 'react';

import {
  convertToCancellablePromise,
  CancellablePromise,
} from 'utils/cancellablePromise';

/* eslint-disable no-promise-executor-return */
const delay = (n: number) => new Promise((resolve) => setTimeout(resolve, n));

const useCancellablePromises = () => {
  const pendingPromises: any = useRef([]);

  const appendPendingPromise = (promise: CancellablePromise) => {
    pendingPromises.current = [...pendingPromises.current, promise];
  };

  const removePendingPromise = (promise: CancellablePromise) => {
    pendingPromises.current = pendingPromises.current.filter(
      (p: CancellablePromise) => p !== promise
    );
  };

  const clearPendingPromises = () =>
    pendingPromises.current.map((p: CancellablePromise) => p.cancel());

  const api = {
    appendPendingPromise,
    removePendingPromise,
    clearPendingPromises,
  };

  return api;
};

export const useClickPreventionOnDoubleClick = (
  onClick: () => void,
  onDoubleClick: () => void,
  interval = 300
) => {
  const api = useCancellablePromises();

  const onHandleClick = () => {
    api.clearPendingPromises();
    const waitForClick = convertToCancellablePromise(delay(interval));
    api.appendPendingPromise(waitForClick);

    return waitForClick.promise
      .then(() => {
        api.removePendingPromise(waitForClick);
        onClick();
      })
      .catch((errorInfo) => {
        api.removePendingPromise(waitForClick);
        if (errorInfo && !errorInfo.isCanceled) {
          if (errorInfo.error) {
            throw errorInfo.error;
          }
        }
      });
  };

  const onHandleDoubleClick = () => {
    api.clearPendingPromises();
    onDoubleClick();
  };

  return [onHandleClick, onHandleDoubleClick];
};
