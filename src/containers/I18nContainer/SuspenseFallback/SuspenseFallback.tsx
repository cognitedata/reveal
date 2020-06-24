/* eslint-disable no-console */
import { useEffect } from 'react';

const SuspenseFallback = () => {
  // Add in metrics support to track how long we're waiting for i18n.
  useEffect(() => {
    console.log('suspending');
    return () => {
      console.log('Done');
    };
  }, []);
  return null;
};

export default SuspenseFallback;
