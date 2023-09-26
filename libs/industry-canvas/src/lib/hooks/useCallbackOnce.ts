import { useState, useCallback } from 'react';

type CallbackFunction<T> = (arg: T) => void;

export const useCallbackOnce = <T>(callback: CallbackFunction<T>) => {
  const [called, setCalled] = useState(false);

  return useCallback(
    (arg: T) => {
      if (!called) {
        setCalled(true);
        // Remove the callback lock after some time passed.
        setTimeout(() => setCalled(false), 5000);
        callback(arg);
      }
    },
    [called, callback]
  );
};
