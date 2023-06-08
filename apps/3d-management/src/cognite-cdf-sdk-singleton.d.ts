declare module '@cognite/cdf-sdk-singleton' {
  import { CogniteClient } from '@cognite/sdk';
  type UserInfo = {
    displayName?: string;
    id: string;
    mail?: string;
    userPrincipalName?: string;
  };

  export declare type Flow =
    | 'COGNITE_AUTH'
    | 'AZURE_AD'
    | 'ADFS'
    | 'OAUTH_GENERIC'
    | 'FAKE_IDP'
    | 'UNKNOWN';

  export declare function logout(): void;
  export declare function loginAndAuthIfNeeded(
    project: string,
    env?: string
  ): Promise<void>;
  export declare function getToken(): Promise<string>;
  export declare function getFlow(): { flow: Flow };
  export declare function getUserInformation(): Promise<UserInfo>;

  declare const sdk: CogniteClient;
  export default sdk;
}
