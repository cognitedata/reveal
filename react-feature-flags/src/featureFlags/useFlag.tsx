import { useEffect, useContext, useState, useCallback } from 'react';
import { FlagContext } from './FlagContext';

type Options = {
  fallback?: boolean;
  forceRerender?: boolean;
};

export const useFlag = (
  flagName: string,
  { fallback = false, forceRerender = false }: Options = {}
) => {
  const { client } = useContext(FlagContext);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    let value = client.isEnabled(flagName);
    if (value === undefined) {
      value = fallback;
    }
    return value;
  });

  const update = useCallback(() => {
    setIsEnabled(client.isEnabled(flagName));
  }, [flagName, client]);

  useEffect(() => {
    if (forceRerender) {
      client.on('update', update);
    }
    return () => {
      client.off('update', update);
    };
  }, [forceRerender, update, client]);

  return isEnabled;
};
