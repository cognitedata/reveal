/*!
 * Copyright 2023 Cognite AS
 */
import React, { useContext, createContext, useMemo } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { FdmSDK } from '../../utilities/FdmSDK';

const SdkContext = createContext<CogniteClient | null>(null);
const FdmSdkContext = createContext<FdmSDK | null>(null);
SdkContext.displayName = 'CogniteSdkProvider';
FdmSdkContext.displayName = 'FdmSdkProvider';

type Props = { sdk: CogniteClient; children: any };
export function SDKProvider({ sdk, children }: Props): React.ReactElement {
  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  return (
    <SdkContext.Provider value={sdk}>
      <FdmSdkContext.Provider value={fdmSdk}>{children}</FdmSdkContext.Provider>
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
  const fdmSdk = useContext(FdmSdkContext);
  if (fdmSdk === null) {
    throw new Error(
      `FdmSdkContext not found, add '<SDKProvider value={sdk}>' around your component/app`
    );
  }
  return fdmSdk;
};
