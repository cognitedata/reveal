/* eslint-disable @typescript-eslint/no-unused-vars */
declare module '@cognite/cdf-sdk-singleton' {
  import { IDPType } from '@cognite/login-utils';
  import { CogniteClient, ClientOptions } from '@cognite/sdk';

  export interface SdkClientTokenProvider {
    getAppId: () => string;
    getToken: () => Promise<string>;
    getUserInformation: () => Promise<UserInfo>;
    getFlow: () => { flow: string };
    logout: () => Promise<void>;
  }

  export declare function getFlow(): { flow: Exclude<IDPType | 'ADFS2016'> };
  export declare function getToken(): Promise<string>;
  export declare function getUserInformation(): Promise<any>;
  export declare function loginAndAuthIfNeeded(): Promise<void>;
  export declare function createSdkClient(
    clientOptions: ClientOptions,
    tokenProvider?: SdkClientTokenProvider
  ): CogniteClient;

  declare const sdk: CogniteClient;
  export default sdk;
}
