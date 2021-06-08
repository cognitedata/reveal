import React, { useEffect } from 'react';
import noop from 'lodash/noop';
import { LoopContext, MountRecord } from './types';

export type Props = {
  /** What do we do when we find a loop? */
  onLoopDetected: (records: MountRecord[]) => void;

  /**
   * How many refreshes qualify as "an infinite loop"?
   */
  loopThresholdCount?: number;

  /**
   * If we see more than {@code loopThresholdCount} renders in this time span
   * then we meet the criteria for "an infinite loop".
   */
  loopWindowMillis?: number;
  storageKey?: string;
};

export const Context = React.createContext<LoopContext>({
  onLoopExit: noop,
  records: [],
});

const LoopDetector = ({
  onLoopDetected,
  loopThresholdCount = 10,
  loopWindowMillis = 60 * 1000,
  storageKey = '@cognite/loop-detector__v1',
  children,
}: React.PropsWithChildren<Props>) => {
  const recordsString = sessionStorage.getItem(storageKey);
  let records: MountRecord[] = [];
  if (recordsString) {
    try {
      records = JSON.parse(recordsString);
    } catch (ex) {
      // Trap this error
      if (process.env.REACT_APP_ENV === 'development') {
        throw ex;
      }
    }
  }

  const recencyThreshold = Date.now() - loopWindowMillis;
  const recentRecords = records.filter(
    ({ timestamp }) => timestamp && timestamp > recencyThreshold
  );

  useEffect(() => {
    recentRecords.push({
      timestamp: Date.now(),
    });

    if (recentRecords.length >= loopThresholdCount) {
      onLoopDetected(recentRecords);
    }

    sessionStorage.setItem(storageKey, JSON.stringify(recentRecords));
  }, [storageKey, loopThresholdCount, onLoopDetected, recentRecords]);

  const onLoopExit = () => {
    sessionStorage.removeItem(storageKey);
  };

  return (
    <Context.Provider value={{ onLoopExit, records: recentRecords }}>
      {children}
    </Context.Provider>
  );
};

export default LoopDetector;
