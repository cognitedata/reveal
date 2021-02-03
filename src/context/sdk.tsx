import React, { useContext } from 'react';
import { CogniteClient } from '@cognite/sdk';

const SdkContext = React.createContext<CogniteClient | null>(null);
SdkContext.displayName = 'CogniteSdkProvider';

type Props = { sdk: CogniteClient; children: any };
export function SDKProvider({ sdk, children }: Props) {
  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>;
}

export const useSDK = () => {
  const sdk = useContext(SdkContext);
  if (!sdk) {
    throw new Error(
      `SdkContext not found, add '<SDKProvider value={sdk}>' around your component/app`
    );
  }
  return sdk;
};
