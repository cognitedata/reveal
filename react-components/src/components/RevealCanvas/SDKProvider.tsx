/*!
 * Copyright 2023 Cognite AS
 */
import React, { useContext, createContext, useMemo } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { FdmSdkContext } from './FdmDataProviderContext';
import { FdmSDK } from '../../data-providers/FdmSDK';
import { LegacyFdm3dDataProvider } from '../../data-providers/legacy-fdm-provider/LegacyFdm3dDataProvider';
import { type Fdm3dDataProvider } from '../../data-providers/Fdm3dDataProvider';
import { CoreDm3dFdm3dDataProvider } from '../../data-providers/core-dm-provider/CoreDm3dDataProvider';

const SdkContext = createContext<CogniteClient | null>(null);

SdkContext.displayName = 'CogniteSdkProvider';
FdmSdkContext.displayName = 'FdmSdkProvider';

type SDKProviderProps = { sdk: CogniteClient; fdm3dDataProvider: Fdm3dDataProvider; children: any };

export function SDKProvider({
  sdk,
  children,
  fdm3dDataProvider
}: SDKProviderProps): React.ReactElement {
  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);
  const content = useMemo(() => ({ fdmSdk, fdm3dDataProvider }), [fdmSdk, fdm3dDataProvider]);

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

export const useFdm3dDataProvider = (): Fdm3dDataProvider => {
  const fdmProvider = useContext(FdmSdkContext);
  if (fdmProvider === null) {
    throw new Error(
      `FdmSdkContext not found, add '<SDKProvider value={sdk}>' around your component/app`
    );
  }

  return fdmProvider.fdm3dDataProvider;
};
