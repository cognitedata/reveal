/*!
 * Copyright 2023 Cognite AS
 */
import React, { useContext, createContext, useMemo } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { FdmSdkContext } from './FdmDataProviderContext';
import { FdmSDK } from '../../data-providers/FdmSDK';

const SdkContext = createContext<CogniteClient | null>(null);

SdkContext.displayName = 'CogniteSdkProvider';
FdmSdkContext.displayName = 'FdmSdkProvider';

type SDKProviderProps = { sdk: CogniteClient; children: any };

export function SDKProvider({ sdk, children }: SDKProviderProps): React.ReactElement {
  const content = useMemo(
    () => ({
      fdmSdk: new FdmSDK(sdk)
    }),
    [sdk]
  );

  return (
    <SdkContext.Provider value={sdk}>
      <FdmSdkContext.Provider value={content}>{children}</FdmSdkContext.Provider>
    </SdkContext.Provider>
  );
}

export const useSDK = (userSdk?: CogniteClient): CogniteClient => {
  const sdk = useContext(SdkContext);
  if (sdk === null) {
    if (userSdk !== undefined) {
      return userSdk;
    }

    throw new Error(
      `SdkContext not found, add '<SDKProvider value={sdk}>' around your component/app`
    );
  }

  return sdk;
};

export const useFdmSdk = (): FdmSDK => {
  const fdmProvider = useContext(FdmSdkContext);
  if (fdmProvider === null) {
    throw new Error(
      `FdmSdkContext not found, add '<SDKProvider value={sdk}>' around your component/app`
    );
  }
  return fdmProvider.fdmSdk;
};
