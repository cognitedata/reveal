import sdk, { createSdkClient } from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';

export interface AppWrapperProps {
  children: React.ReactNode;
}
export const AuthContainer = (props: AppWrapperProps) => {
  const tokenProvider = {
    getAppId: () => 'apps.cognite.com/cdf',
    getToken: async () => 'mock',
    getUserInformation: async () =>
      await Promise.resolve(() => ({
        id: '267cfdd8-a207-4320-80f2-a4352b15048f',
        mail: 'mock-user@mail.com',
        displayName: 'Mock User',
      })),
    getFlow: () => ({ flow: 'AZURE_AD' }),
    logout: () => Promise.resolve(),
  };
  const sdkClient = createSdkClient(
    {
      appId: tokenProvider.getAppId(),
      getToken: async () =>
        window.testAuthOverrides ? (window as any).testAuthOverrides() : 'mock',
      baseUrl: window.location.origin,
      project: 'platypus',
    },
    tokenProvider
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sdkClient.initAPIs();

  // eslint-disable-next-line
  // @ts-ignore
  sdk.overrideInstance(sdkClient);

  return <SDKProvider sdk={sdkClient}>{props.children}</SDKProvider>;
};
