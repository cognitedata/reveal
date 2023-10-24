/* eslint-disable @typescript-eslint/no-unused-vars */
declare module '@cognite/cdf-sdk-singleton' {
  import {
    CogniteClient,
    Acl,
    SingleCogniteCapability,
    AclScopeAll,
    ClientOptions,
  } from '@cognite/sdk';

  export interface SdkClientTokenProvider {
    getAppId: () => string;
    getToken: () => Promise<string>;
    getUserInformation: () => Promise<UserInfo>;
    getFlow: () => { flow: string };
    logout: () => Promise<void>;
  }

  export declare type Flow =
    | 'COGNITE_AUTH'
    | 'AZURE_AD'
    | 'ADFS'
    | 'OAUTH_GENERIC'
    | 'FAKE_IDP'
    | 'UNKNOWN';

  export declare function getFlow(): { flow: Flow };
  export declare function getToken(): Promise<string>;
  export declare function getUserInformation(): Promise<{
    displayName?: string;
    id: string;
    mail?: string;
    userPrincipalName?: string;
  }>;
  export declare function loginAndAuthIfNeeded(): Promise<void>;
  export declare function createSdkClient(
    clientOptions: ClientOptions,
    tokenProvider?: SdkClientTokenProvider
  ): CogniteClient;

  declare const sdk: CogniteClient;
  export default sdk;
}
