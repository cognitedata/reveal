import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import sdk from '@cognite/cdf-sdk-singleton';

import { generateSasToken } from '../utils/generateSasToken';

export type IoTParams = {
  resourceUri: string;
  signingKey: string;
  policyName: string;
};

const IoTContext = createContext<
  | {
      iotParams: IoTParams;
      isValidParams: boolean;
      setIotParams: (newParams: IoTParams) => void;
    }
  | undefined
>(undefined);

export const IoTProvider = ({ children }: PropsWithChildren) => {
  const key = `${sdk.project}-iot-hub-iotParams`;

  const [iotParams, setIotParams] = useState<{
    resourceUri: string;
    signingKey: string;
    policyName: string;
  }>({
    resourceUri: '',
    signingKey: '',
    policyName: '',
    ...JSON.parse(localStorage.getItem(key) || '{}'),
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(iotParams));
  }, [iotParams, key]);

  const isValidParams = useMemo(() => {
    return Object.values(iotParams).every((value) => value.trim().length > 0);
  }, [iotParams]);

  return (
    <IoTContext.Provider value={{ iotParams, setIotParams, isValidParams }}>
      {children}
    </IoTContext.Provider>
  );
};

export const useIoT = () => {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used within an instance of IoTProvider');
  }
  return context;
};

export const useSASToken = () => {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used within an instance of IoTProvider');
  }
  const token = useMemo(
    () =>
      generateSasToken(
        context.iotParams.resourceUri,
        context.iotParams.signingKey,
        context.iotParams.policyName
      ),
    [context.iotParams]
  );
  return token;
};
