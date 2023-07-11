import React, { useContext, createContext, useMemo} from 'react';
import { CogniteClient } from '@cognite/sdk';
import { FdmSDK } from '../../utilities/FdmSdk';

const SdkContext = createContext<CogniteClient | null>(null);
const FdmSdkContext = createContext<FdmSDK | null>(null);
SdkContext.displayName = 'CogniteSdkProvider';
FdmSdkContext.displayName = 'FdmSdkProvider';

type Props = { sdk: CogniteClient; children: any };
export function SDKProvider({ sdk, children }: Props) {
    const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

    return (
        <SdkContext.Provider value={sdk}>
            <FdmSdkContext.Provider value={fdmSdk}>
                {children}
            </FdmSdkContext.Provider>
        </SdkContext.Provider>);
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

export const useFdmSdk = () => {
    const fdmSdk = useContext(FdmSdkContext);
    if (!fdmSdk) {
        throw new Error(
            `FdmSdkContext not found, add '<SDKProvider value={sdk}>' around your component/app`
        );
    }
    return fdmSdk;
};