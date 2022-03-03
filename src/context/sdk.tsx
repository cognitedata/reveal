import React, { useContext } from 'react';
import { CogniteClient } from '@cognite/sdk';

type Flow =
  | 'COGNITE_AUTH'
  | 'AZURE_AD'
  | 'ADFS'
  | 'OAUTH_GENERIC'
  | 'FAKE_IDP'
  | 'UNKNOWN';

const SDKContext = React.createContext<CogniteClient | null>(null);
SDKContext.displayName = 'CogniteSdkProvider';

type Props = { sdk: CogniteClient; children: any };
export function SDKProvider({ sdk, children }: Props) {
  return <SDKContext.Provider value={sdk}>{children}</SDKContext.Provider>;
}

export const useSDK = () => {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error(
      `SDKContext not found, add '<SDKProvider value={sdk}>' around your component/app`
    );
  }
  return sdk;
};
