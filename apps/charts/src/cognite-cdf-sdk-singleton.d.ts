/* eslint-disable @typescript-eslint/no-unused-vars */
declare module '@cognite/cdf-sdk-singleton' {
  import { CogniteClient, ClientOptions } from '@cognite/sdk';

  export type UserInfo = {
    displayName?: string;
    givenName?: string;
    id: string;
    mail?: string;
    userPrincipalName?: string;
    profilePicture?: string; // if defined, then a URL to the picture
  };

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

  export declare function logout(): void;
  export declare function getToken(): Promise<string>;
  export declare function getFlow(): { flow: Flow };
  export declare function getUserInformation(): Promise<UserInfo>;
  export declare function loginAndAuthIfNeeded(): Promise<void>;
  export declare function createSdkClient(
    clientOptions: ClientOptions,
    tokenProvider?: SdkClientTokenProvider
  ): CogniteClient;

  declare const sdk: CogniteClient;
  export default sdk;
}
