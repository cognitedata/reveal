import React from 'react';
import { CogniteClient } from '@cognite/sdk';

export const SdkContext = React.createContext<CogniteClient | null>(null);
SdkContext.displayName = 'CogniteSdkProvider';

type Props = { sdk: CogniteClient; children: any };
export function SDKProvider({ sdk, children }: Props) {
  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>;
}
